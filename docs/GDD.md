# Necropsy: Documento de diseño de juego (GDD)

Versión 0.2, 2026-10-29. Proyecto en Unity 6000.5.6f1 (URP 17.5).

Estado de cada sección: **[Definido]** lo decidió el equipo, **[Propuesto]** es una propuesta pendiente de confirmar, **[Pendiente]** falta decidirlo.

---

## 1. Resumen

**Concepto.** Roguelike gótico cooperativo en línea para dos jugadores, con vista cenital al estilo Enter the Gungeon, en un mundo 3D con personajes y enemigos de aspecto pixel art. Una orden de caballeros envía a dos cazadores a matar a tres jefes, cada uno encarnación de un sentimiento negativo. **[Definido]**

**Qué lo hace especial.**
- Cazar es investigar: el jugador deduce la debilidad de cada jefe y prepara arma y ungüento en consecuencia.
- Cada jefe se pelea al compás de una canción real, y esa canción se va revelando por capas durante el nivel.
- Cada nivel está corrompido por un sentimiento que cambia enemigos, entorno y PNJ.

**Plataforma.** PC (Windows) con teclado y ratón, y mando. **[Propuesto]**

**Contexto y público [Definido].** Es el proyecto final de una materia. No se publicará: el público es el equipo docente y los jugadores de la demostración. La entrega es a mediados de diciembre de 2026, unas 7 semanas desde el 2026-10-28. Se evalúa que el juego sea multijugador, divertido, que se pueda jugar durante un día entero y que sea adictivo. **[Pendiente]**: formato de la presentación y si se trabaja en equipo o en solitario.

**Referencias.** Enter the Gungeon (cámara, salas, combate), Bloodborne (tono de cacería), Hades y Slay the Spire (progresión por rutas), Pokémon (tabla de eficacia legible), Monster Hunter (preparar el equipo según el monstruo).

## 2. Pilares de diseño [Definido]

1. **La caza como investigación.** Las pistas permiten deducir la debilidad del demonio y se traducen en una decisión de equipo.
2. **La música como clímax.** La canción del jefe suena por capas durante el nivel y entera en el combate.

## 3. Lore y mundo [Definido]

Los dos protagonistas no tienen historia propia: son cazadores enviados a matar a los jefes. Cada jefe encarna un sentimiento negativo que corrompe su nivel. Enemigos y entorno cambian según ese sentimiento, y los PNJ muestran visiblemente cómo se corrompen.

| Nivel | Lugar | Jefe | Sentimiento | Música |
|---|---|---|---|---|
| 1 | Castillo gótico oscuro | Caballero gótico demonio | Ira | Deftones (las canciones más agresivas) |
| 2 | Iglesia, centro de culto del jefe | Ángel carmesí, un demonio con apariencia de ángel | Orgullo o vanidad | Loathe (las canciones más suaves) |
| 3 | Ruinas o catacumbas | Joven del vacío, de pelo blanco y túnica | Depresión o vacío | Radiohead |

Notas de tono: el jefe 3 se trata como una figura trágica, sin imágenes explícitas ni mecánicas ligadas a la autolesión.

**Diseño de personajes [Definido, según las hojas de arte aprobadas].**
- **Jefe 1, caballero gótico demonio:** complexión esbelta, con poco músculo. Pelo largo, oscuro y ondulado, sin mechón blanco (el equipo prefiere así). Ojos rojos, armadura negra ajustada con hombreras y detalles de púas, capa larga rota con una cruz roja en la espalda, cadenas, y una espada con espinas y vetas rojas.
- **Jefe 2, ángel carmesí:** armadura completa al estilo de Berserk, toda de un rojo sangre brillante, sin dorados, que cubre el cuerpo entero salvo las alas y el rostro. Alas blancas y pelo largo blanco como las alas. Rostro perfecto, de piel clara natural como una persona europea, con ojos rojos. Complexión masculina y esbelta. La hoja aprobada no incluye halo.
- **Jefe 3, joven del vacío:** pelo blanco y desordenado, ojos llorosos y ojeras, marca de soga en el cuello, túnica larga y rota atada con una cuerda que cubre los pantalones, vendas en antebrazos y piernas, descalzo. Piel pálida.
- **Templario:** caballero pesado con armadura de placas oscura, yelmo cerrado con cruz, tabardo carmesí con cruces, escudo enorme y hacha pesada. Al modelarlo hay que añadir un cuello o gorjal visible, porque en las vistas de lado y espalda el yelmo parece flotar.
- **Cazador:** diseño propio que no copia al de Bloodborne. Toda la ropa es negra, de tela y lana, sin cuero: capucha con la cara cubierta, bufanda tejida, poncho de retazos, vendajes en brazos y piernas, guantes tejidos, faja con bolsas y viales. Costuras naranja brasa como único acento. Lleva una guadaña, un arco y un carcaj en la espalda.

Las imágenes aportadas por el usuario son referencias de ambiente, no assets del juego.

## 4. Jugabilidad

### 4.1 Bucle central [Propuesto]
Entrar al piso, explorar salas con puertas, combatir enemigos comunes, reunir pistas, armas e ingredientes, preparar el arma en la sala de preparación y enfrentar al jefe. Al vencerlo, pasar al siguiente nivel. Una partida completa son los tres niveles seguidos: castillo, iglesia y catacumbas. Si caen los dos jugadores, la partida termina y se vuelve al nivel 1 (ver 4.8). **[Definido]**

Entre niveles de una misma partida pasa todo: armas, ingredientes y ungüentos. El arma conserva su ungüento aplicado hasta que se aplica otro. Como el ungüento correcto es distinto en cada jefe, hay que volver a preparar el arma en cada nivel. **[Definido]** **[Pendiente]**: límite de ingredientes y de armas en el inventario, para que no se acumule sin freno.

### 4.2 Controles y cámara [Definido]
Cámara cenital inclinada fija. Movimiento libre. El jugador apunta y ataca hacia el cursor (teclado y ratón) o hacia el stick derecho (mando). La esquiva es una rodada.

### 4.3 Clases [Definido]
- **Templario:** caballero pesado. Se mueve y ataca más despacio, pega fuerte y aguanta.
- **Cazador:** cazador de monstruos rápido y ágil, pero hace menos daño por golpe.

Cada partida tiene exactamente un Templario y un Cazador: los dos jugadores no pueden elegir la misma clase. Si uno elige una, el otro recibe la restante. El juego es solo cooperativo de dos jugadores: no hay modo en solitario ni compañero controlado por IA. Para probar en desarrollo se abren dos instancias en el mismo PC.

**Habilidades de clase [Definido].**
- **Templario, escudo gigante:** levanta un escudo enorme que protege a quien lo usa y al Cazador. Valores por afinar en el prototipo: duración, enfriamiento, resistencia del escudo, si el Templario puede moverse mientras lo mantiene y si bloquea todo o solo un arco frontal.
- **Cazador, marca del cazador:** marca a un enemigo o al jefe, y todo el daño que recibe aumenta durante un tiempo, venga de quien venga. Combina con el Templario, lento pero fuerte. Valores por afinar: bonificación de daño, duración, enfriamiento, alcance y si solo se puede tener un objetivo marcado a la vez. La bonificación se aplica sobre el daño ya calculado por la tabla de eficacia.
- Riesgo de equilibrio: un escudo que bloquee todos los proyectiles puede anular los patrones del jefe. Mitigaciones propuestas: resistencia limitada, enfriamiento largo, bloqueo solo frontal y algunos ataques del jefe que no se pueden bloquear. **[Propuesto]**

### 4.4 Armas [Definido, contenido propuesto]
- Templario: hachas, espadas, ballestas y lanzas.
- Cazador: arcos, hoces, guadañas y sierras.
- Cada arma tiene categoría, tipo de daño y material. Cada clase solo puede usar su grupo. Las restricciones viven en datos.
- Contenido mínimo para el primer jefe **[Propuesto]**: tipos de daño cortante, perforante y contundente (el hacha del Templario es contundente); materiales hierro, plata, hueso y obsidiana; unas 8 armas, 4 por clase.
- Las armas se encuentran en el nivel (suelo y cofres). Cada clase empieza con una arma básica. **[Propuesto]**

### 4.5 Ungüentos y eficacia [Definido]
- Contra un jefe, un arma sin untar funciona, pero con un daño ridículamente bajo.
- Cada jefe tiene un ungüento correcto, que se revela en la investigación. Solo ese ungüento desbloquea el daño contra ese jefe. Los demás no suman contra él, pero tienen sus efectos contra enemigos comunes.
- Con el ungüento correcto, la eficacia depende de la combinación de material y tipo de daño del arma, según la tabla del jefe: poco eficaz, normal o muy eficaz. El orden de daño es sin untar < poco eficaz < normal < muy eficaz.
- El ungüento dura hasta que el jefe muere o hasta que se aplica otro, que reemplaza al anterior.
- Los ungüentos se preparan con ingredientes encontrados en el nivel, en una sala de preparación antes de la puerta del jefe. Cada jugador unta su propia arma. Los ingredientes van a un inventario compartido y el generador garantiza que alcancen para las dos armas. **[Propuesto]**
- Contra enemigos comunes, cada ungüento aplica un estado simple (veneno, fuego o sangrado). El arma sin untar funciona con normalidad. **[Propuesto]**
- Nunca hay bloqueo: se puede entrar al jefe sin untar, con daño mínimo.
- Regla de cobertura: la tabla de cada jefe debe dar a cada clase al menos una combinación normal o muy eficaz.
- Detalle completo en `docs/superpowers/specs/2026-10-27-armas-unguentos-design.md`.

### 4.6 Investigación [Definido]
Las pistas revelan el ungüento correcto y qué materiales y tipos de daño son fuertes o débiles contra el jefe. La etiqueta de eficacia se muestra después de golpear y se registra en el bestiario. **[Propuesto]**

**Cuaderno del cazador.** Las pistas llegan como entradas de un cuaderno que se llena al examinar objetos, escenas y PNJ corrompidos del nivel. Cada entrada revela una parte de la información: el ungüento correcto, o qué materiales y tipos de daño sirven contra el jefe. El jugador junta las piezas. El cuaderno hace también de bestiario y es compartido: lo que descubre uno lo ve el otro. **[Pendiente]**: cuántas pistas hay por nivel y si se puede llegar al jefe sin completarlo.

### 4.7 Combate [Definido]
El ataque sale hacia donde se apunta, como en Enter the Gungeon. La esquiva es una rodada con una ventana corta de invulnerabilidad. Las armas a distancia (ballesta, arco) disparan proyectiles hacia el punto apuntado. Las armas cuerpo a cuerpo golpean en un arco frente al jugador. Los jefes usan patrones de proyectiles y ataques sincronizados con la canción. **[Pendiente]**: duración de la rodada, cuándo es invulnerable y cuánto tardan los ataques de cada arma.

### 4.8 Muerte y progresión
- **Caer y revivir [Definido]:** un jugador que cae queda en el suelo y el compañero puede revivirlo acercándose unos segundos. Si caen los dos, termina la partida y se vuelve al nivel 1 con todo de cero. Duración del revivir y límite de revivires: **[Pendiente]**.
- **Entre partidas [Definido]:** no se conserva nada. Cada partida empieza de cero, sin herencia ni progresión permanente. La única memoria entre partidas es el conocimiento del propio jugador (pistas, debilidades, recetas).
- **Guardado:** como no hay progresión, el guardado se limita a ajustes. **[Pendiente]**

### 4.9 Rejugabilidad [Propuesto]
Para cumplir con "jugable durante un día entero" sin crear más contenido, se propone que cada partida genere de nuevo las debilidades del jefe (qué ungüento es el correcto y la tabla de eficacia), de modo que el mismo jefe sea un puzzle distinto cada vez, y que tras vencer al jefe final empiece un ciclo más difícil con las salas reordenadas. Las salas y el botín también varían con la semilla. Requiere un grupo de pistas lo bastante grande para que la deducción no se repita.

## 5. Niveles

### 5.1 Estructura [Definido]
Salas modulares con puertas, rutas ramificadas y variación por semilla. Cada nivel tiene identidad artística y de sentimiento propia, y cada partida dispone las salas de forma distinta. Modificadores de sala (niebla, ceniza, velas que se apagan) y eventos (altares con trato, prisioneros, cofres trampa) **[Propuesto]**.

### 5.2 Efecto del sentimiento [Propuesto]
- Ira: enemigos rápidos y patrones agresivos.
- Orgullo: espejos y ataques que castigan descuidos.
- Depresión: niebla, ralentización y patrones que se desvanecen.

### 5.3 Corrupción de PNJ [Definido en intención]
Los PNJ del entorno muestran visiblemente cómo el sentimiento los corrompe. **[Pendiente]**: cuántos PNJ por nivel y si interactúan.

## 6. Enemigos y jefes

- **Enemigos comunes:** 3 o 4 tipos para el primer nivel. **[Pendiente]**: diseño de cada uno.
- **Jefes:** combate de varias fases, con patrones de proyectiles al compás de la canción. Cada jefe tiene una tabla de eficacia y un ungüento correcto. **[Definido]**
- Jefe 1: caballero gótico demonio (ira). Prioridad máxima: es el primero que debe quedar completo.

## 7. Música y audio

- Las canciones de los jefes se afinan a mano. No hay análisis automático de audio en tiempo real, y el mapa no se genera desde el audio. **[Definido]**
- Durante el nivel suena la canción del jefe filtrada o por capas, completándose a medida que se avanza, hasta sonar entera en el combate. **[Definido]** Se usan stems separados por pista. **[Propuesto]**
- Nivel 1: canciones agresivas de Deftones. Nivel 2: canciones suaves de Loathe. Nivel 3: Radiohead. **[Pendiente]**: canción exacta de cada jefe.
- Sincronización en red: se sincroniza la hora de inicio de la canción y los patrones del jefe son deterministas. **[Propuesto]**
- Música ambiente entre jefes: **[Pendiente]**.
- Derechos: el proyecto es de uso personal y no se publicará, por eso se usan canciones comerciales. Si algún día se publica, hace falta licencia o música alternativa.

## 8. Arte y estilo visual

- Todo el arte, incluido el conceptual, se hace en pixel art con apariencia 3D. **[Definido]**
- Personajes y enemigos son modelos 3D generados a partir de las hojas de arte conceptual, mostrados con aspecto pixel art: render a baja resolución con filtro de punto sobre un mundo 3D con luz y niebla. **[Definido]** el uso de modelos 3D, **[Propuesto]** la técnica de pixelado en URP.
- Flujo de producción **[Propuesto]**: hoja de arte conceptual aprobada, recorte de una vista limpia por imagen (frente, lado, espalda), generación del modelo con Meshy (plan Pro, API), limpieza y rig, e importación a Unity con el efecto de pixelado.
- Las animaciones de un modelo con rig se resuelven con animaciones de biblioteca o a mano. **[Pendiente]**: cuáles y de dónde.
- Paleta e identidad distintas por nivel: rojo y negro en el castillo, rojo, dorado y negro en la iglesia, azul frío y negro en las catacumbas. **[Definido]**
- Arte de los enemigos comunes y de los objetos: **[Pendiente]**.

## 9. Interfaz [Pendiente]
HUD (vida, arma, ungüento), sala de preparación, etiqueta de eficacia tras golpear, cuaderno, menús de lobby.

## 10. Multijugador y técnica

- Cooperativo en línea de 2 jugadores desde el día 1. Netcode for GameObjects con Relay. **[Definido]**
- El servidor (el jugador anfitrión) calcula daño y estado. Los clientes envían entrada y muestran el resultado. **[Propuesto]**
- Datos de balance en `ScriptableObject`. Eventos desacoplados entre sistemas. **[Definido]**
- Guardado: **[Pendiente]**.
- Lobby y conexión: **[Pendiente]**.

## 11. Alcance y cronograma

El plan es hacer todo lo que se pueda, sin recortes de antemano. Los hitos están ordenados para que al final de cada uno haya un juego completo y jugable. Si el tiempo se acaba, se recorta desde el final, por orden de prioridad. **[Definido]**

**Hitos hasta mediados de diciembre [Propuesto]:**
1. Hasta el 4 de noviembre: dos jugadores conectados en línea, moviéndose, esquivando y eligiendo clase.
2. Hasta el 11 de noviembre: combate, armas por datos, escudo del Templario, marca del Cazador y primeros enemigos.
3. Hasta el 18 de noviembre: salas aleatorias con puertas, botín, ingredientes y cuaderno compartido.
4. Hasta el 25 de noviembre: ungüentos, tabla de eficacia, sala de preparación y jefe 1 con su canción.
5. Hasta el 2 de diciembre: debilidades aleatorias por partida y dificultad creciente (ver 4.9).
6. Hasta el 9 de diciembre: nivel 2 y, si alcanza, nivel 3.
7. Hasta el 15 de diciembre: pulido, pruebas con un segundo jugador real y presentación.

La generación de modelos 3D corre en paralelo a los hitos 1 a 4.

**Estado al 2026-10-29:** diseño y arte conceptual aprobados. Aún no hay código del juego.

**Fuera del alcance inicial:** demonios que recuerdan, corrupción como medidor, refugio restaurable, armas que evolucionan, herencia entre partidas.

## 12. Riesgos

- Que la esquiva y el combate no se sientan bien. Es lo que más define el género.
- Sincronizar los patrones del jefe con la canción entre dos jugadores en red.
- Equilibrar la tabla de eficacia y el ritmo de hallar ingredientes y armas.
- Calidad de los modelos 3D generados por IA: pueden necesitar limpieza, rig y animación, y consumen créditos del plan.
- El alcance crece fácilmente: tres niveles, tres jefes, cooperativo en línea y generación de salas en siete semanas.
- Jugar "durante un día entero" depende de la rejugabilidad (4.9), que aún es una propuesta.
- Derechos de la música si el juego se publica.

## 13. Preguntas abiertas

- Tiempos de la rodada y de los ataques de cada arma.
- Límite de inventario de armas e ingredientes.
- Cuántas pistas por nivel y si se puede llegar al jefe sin completar el cuaderno.
- Duración del revivir y límite de revivires.
- Lista final de tipos de daño y materiales, y la tabla de cada jefe.
- Canción exacta de cada jefe y música ambiente.
- Diseño de los enemigos comunes y de los PNJ corrompidos.
- HUD, guardado de ajustes y flujo de lobby y conexión.
- Animaciones de los modelos 3D.
- Formato de la presentación y si se trabaja en equipo o en solitario.
- Aprobación de la rejugabilidad propuesta (4.9).

## 14. Arte conceptual

Hojas de arte aprobadas por el equipo, en pixel art con apariencia 3D. Las originales están en `D:\Necropsy_ConcepArts` y las copias de trabajo en `docs/concept/`. Las versiones pintadas de la primera ronda quedaron archivadas en `docs/concept/anteriores/`.

- Jefe 1: caballero gótico demonio (ira). Vistas de frente, lado y espalda, rostro, espada y paleta.
- Jefe 2: ángel carmesí (orgullo o vanidad). Vistas de frente, lado y espalda, rostro, armadura y paleta.
- Jefe 3 y Templario: joven del vacío y caballero templario, en una hoja con vistas de frente, lado y espalda, detalles y paleta.
- Cazador: hoja con vista de frente, espalda, armas y rostro.
- Nivel 1: castillo gótico bajo la luna roja.
- Nivel 2: iglesia gótica de vitrales rotos.
- Nivel 3: cripta gótica entre niebla y velas.
