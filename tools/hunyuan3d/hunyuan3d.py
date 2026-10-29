#!/usr/bin/env python3
"""Cliente de línea de comandos para la API internacional de Tencent HY 3D (Hunyuan3D).

Convierte una imagen conceptual (o un texto) en un modelo 3D.

Las credenciales nunca se guardan en archivos: se leen de variables de entorno.
    TENCENTCLOUD_SECRET_ID
    TENCENTCLOUD_SECRET_KEY
    TENCENTCLOUD_REGION   (opcional, por defecto ap-singapore)

Comandos:
    check                      verifica las credenciales sin gastar créditos
    submit  --image RUTA|--prompt TEXTO --yes   envía un trabajo (GASTA créditos)
    status  JOB_ID             consulta el estado de un trabajo
    download JOB_ID --out DIR  espera a que termine y descarga los archivos

Costos por trabajo (docs de Tencent): Normal 25, LowPoly 30, Geometry 15 créditos;
EnablePBR suma 10. Los trabajos fallidos no se cobran.
"""

import argparse
import base64
import json
import os
import sys
import time
import urllib.request

from tencentcloud.common import credential
from tencentcloud.common.common_client import CommonClient
from tencentcloud.common.exception.tencent_cloud_sdk_exception import TencentCloudSDKException
from tencentcloud.common.profile.client_profile import ClientProfile
from tencentcloud.common.profile.http_profile import HttpProfile

ENDPOINT = "hunyuan.intl.tencentcloudapi.com"
SERVICE = "hunyuan"
VERSION = "2023-09-01"
MAX_BASE64_BYTES = 8 * 1024 * 1024  # límite de la API para la imagen codificada

COSTS = {"Normal": 25, "LowPoly": 30, "Geometry": 15, "Sketch": 25}


def make_client():
    secret_id = os.environ.get("TENCENTCLOUD_SECRET_ID")
    secret_key = os.environ.get("TENCENTCLOUD_SECRET_KEY")
    if not secret_id or not secret_key:
        sys.exit("Faltan TENCENTCLOUD_SECRET_ID y/o TENCENTCLOUD_SECRET_KEY en el entorno.")

    http = HttpProfile()
    http.endpoint = ENDPOINT
    profile = ClientProfile()
    profile.httpProfile = http
    region = os.environ.get("TENCENTCLOUD_REGION", "ap-singapore")
    return CommonClient(SERVICE, VERSION, credential.Credential(secret_id, secret_key), region, profile=profile)


def call(client, action, params):
    try:
        return client.call_json(action, params)["Response"]
    except TencentCloudSDKException as e:
        sys.exit(f"Error de la API ({e.code}): {e.message}")


def cmd_check(_args):
    client = make_client()
    # Un JobId inventado no gasta nada. Si las credenciales son malas el error
    # es de autenticación; cualquier otro error significa que se aceptaron.
    try:
        client.call_json("QueryHunyuanTo3DProJob", {"JobId": "credential-check"})
        print("Credenciales aceptadas.")
    except TencentCloudSDKException as e:
        if str(e.code).startswith("AuthFailure"):
            sys.exit(f"Credenciales rechazadas ({e.code}): {e.message}")
        print(f"Credenciales aceptadas (la API respondió {e.code}, esperado para un JobId falso).")


def cmd_submit(args):
    if bool(args.image) == bool(args.prompt):
        sys.exit("Indica exactamente una entrada: --image o --prompt.")
    if not args.yes:
        cost = COSTS.get(args.type, 25) + (10 if args.pbr else 0)
        sys.exit(f"Esto gasta unos {cost} créditos. Repite el comando con --yes para confirmar.")

    params = {"GenerateType": args.type, "EnablePBR": args.pbr, "Model": args.model}
    if args.faces:
        params["FaceCount"] = args.faces

    if args.image:
        with open(args.image, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("ascii")
        if len(encoded) > MAX_BASE64_BYTES:
            sys.exit("La imagen codificada supera 8 MB. Reduce su tamaño.")
        params["ImageBase64"] = encoded
    else:
        params["Prompt"] = args.prompt

    result = call(make_client(), "SubmitHunyuanTo3DProJob", params)
    print(json.dumps({"JobId": result["JobId"]}, ensure_ascii=False))


def cmd_status(args):
    result = call(make_client(), "QueryHunyuanTo3DProJob", {"JobId": args.job_id})
    print(json.dumps(result, ensure_ascii=False, indent=2))


def cmd_download(args):
    client = make_client()
    deadline = time.time() + args.timeout
    while True:
        result = call(client, "QueryHunyuanTo3DProJob", {"JobId": args.job_id})
        status = result.get("Status")
        print(f"Estado: {status}", flush=True)
        if status == "DONE":
            break
        if status == "FAIL":
            sys.exit(f"Falló: {result.get('ErrorCode')} {result.get('ErrorMessage')}")
        if time.time() > deadline:
            sys.exit("Se agotó el tiempo de espera. Consulta de nuevo con el comando status.")
        time.sleep(10)

    os.makedirs(args.out, exist_ok=True)
    for i, f in enumerate(result.get("ResultFile3Ds") or []):
        kind = (f.get("Type") or "bin").lower()
        for key, suffix in (("Url", ""), ("PreviewImageUrl", "_preview")):
            url = f.get(key)
            if not url:
                continue
            ext = "png" if key == "PreviewImageUrl" else kind
            path = os.path.join(args.out, f"{args.name}{suffix}_{i}.{ext}")
            urllib.request.urlretrieve(url, path)
            print("Guardado", path)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("check").set_defaults(func=cmd_check)

    p = sub.add_parser("submit")
    p.add_argument("--image")
    p.add_argument("--prompt")
    p.add_argument("--type", default="Normal", choices=["Normal", "LowPoly", "Geometry"])
    p.add_argument("--pbr", action="store_true")
    p.add_argument("--faces", type=int)
    p.add_argument("--model", default="3.0", choices=["3.0", "3.1"])
    p.add_argument("--yes", action="store_true")
    p.set_defaults(func=cmd_submit)

    p = sub.add_parser("status")
    p.add_argument("job_id")
    p.set_defaults(func=cmd_status)

    p = sub.add_parser("download")
    p.add_argument("job_id")
    p.add_argument("--out", required=True)
    p.add_argument("--name", default="modelo")
    p.add_argument("--timeout", type=int, default=900)
    p.set_defaults(func=cmd_download)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
