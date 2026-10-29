# Armas, materiales y ungüentos: diseño

Fecha: 2026-10-27. Proyecto: Necropsy (Unity 6000.5.6f1, URP, Netcode for GameObjects).

## Intención y porqué

Necropsy es un roguelike gótico cooperativo en línea de dos jugadores. Uno de sus pilares es que cazar es investigar: el jugador no sabe qué demonio enfrenta hasta reunir pistas, y lo que descubre debe cambiar cómo se prepara. Este sistema es la forma concreta de esa idea. La decisión que importa no es "qué arma tiene el número más alto", sino "qué arma y qué ungüento preparo para este jefe, según lo que deduje".

## Metas

- La investigación se traduce en una decisión de equipo concreta antes de entrar al jefe.
- Combinar arma y ungüento da un resultado legible al estilo Pokémon: poco eficaz, normal o muy eficaz.
- Cada clase tiene una identidad de armas propia y las dos aportan en cada jefe.
- Todo se define con datos (`ScriptableObject`), de modo que añadir un jefe o un arma no requiera código.

## No metas

- Sin números continuos de resistencia tipo Souls (se descartó, ver Aproximaciones).
- Sin sistema de etiquetas con reglas emergentes.
- No se diseñan aquí las pistas de la investigación ni la generación de salas. Solo se define qué información deben revelar.

## Anti-metas (fallos aunque funcione)

- Que un jugador quede bloqueado sin poder avanzar por no haber encontrado el arma o los ingredientes.
- Que una clase no tenga ninguna opción útil contra algún jefe y quede de espectadora.
- Que el resultado dependa de un cálculo oculto que el jugador no pueda deducir con las pistas.

## Restricciones

- Red: el servidor calcula el daño. Los clientes solo envían la intención y muestran la etiqueta de eficacia.
- Alcance a 2 meses: un piso corto y un jefe. La cantidad de contenido de este documento es la mínima para ese jefe.
- Todo dato de balance vive en `ScriptableObject`, no en código.

## Aproximaciones consideradas

- **A. Tablas de datos con tres niveles (elegida).** Listas fijas de tipos de daño, materiales y ungüentos. Cada jefe tiene una tabla de eficacia y su ungüento correcto. Es fácil de equilibrar, las pistas apuntan a respuestas concretas y cabe en el plazo.
- **B. Etiquetas con reglas.** Más emergente, pero difícil de equilibrar y de explicar con pistas claras.
- **C. Resistencias numéricas.** Resultados graduales, pero pierde el efecto "Pokémon" y complica las pistas.

El usuario eligió A.

## Reglas decididas por el usuario

1. Los caballeros (Templario) usan hachas, espadas, ballestas y lanzas. Los cazadores usan arcos, hoces, guadañas y sierras. Cada clase solo puede usar su grupo.
2. Cada arma tiene una categoría, un tipo de daño y un material.
3. Cada nivel ofrece varias categorías de armas con tipos de daño y materiales distintos.
4. Un ungüento se prepara con ingredientes que se encuentran en el nivel, y se aplica al arma.
5. El ungüento tiene su propio tipo, que entra en la tabla de eficacia junto con el material y el tipo de daño del arma.
6. Contra un jefe, un arma sin untar funciona, pero hace un daño ridículamente bajo.
7. Cada jefe tiene un ungüento correcto, que se revela en la investigación. Ese ungüento siempre suma. Los demás ungüentos no suman contra ese jefe, pero sí tienen sus efectos contra enemigos comunes.
8. Con el ungüento correcto, la eficacia del arma contra el jefe varía entre poco eficaz, normal y muy eficaz según la combinación de material y tipo de daño.
9. Contra enemigos comunes, el arma sin untar funciona con normalidad.

## Propuestas del diseñador (a confirmar)

Estas piezas las propuse yo para poder planificar; el usuario las aceptó en general ("lo que propones está muy bien") salvo donde se indica.

- **Sala de preparación:** antes de la puerta del jefe hay una sala donde se unta el arma, para que el momento de decidir sea claro. Cada jugador unta su propia arma. Los ingredientes están repartidos por el nivel, así que en cooperativo hay que acordar quién recoge qué.
- **Sin bloqueo:** si no se consigue el ungüento correcto, se puede entrar al jefe igualmente con daño mínimo. Es posible, pero lento.
- **Un ungüento incorrecto contra el jefe es igual a no untar.** Es mi lectura de la regla 7; el usuario la confirmó con "otros no suman para el jefe".
- **Contenido mínimo para el primer jefe (propuesta):**
  - Tipos de daño: cortante, perforante, contundente.
  - Materiales: hierro, plata, hueso, obsidiana.
  - Ungüentos: tres, cada uno con un tipo propio y un efecto contra enemigos comunes.
  - Armas: unas 8 en total, 4 por clase.
- **Regla de cobertura:** la tabla de cada jefe debe dar a cada clase al menos una combinación normal o muy eficaz. Nota: entre las armas del Templario y del Cazador no hay ninguna claramente contundente, así que habrá que decidir si alguna lo es (por ejemplo un hacha pesada) o si ese tipo de daño se omite.
- **Tamaño del daño sin untar:** una fracción pequeña fija del daño normal (por ejemplo 5 %), a afinar jugando.

## Estructura de datos (nivel de diseño)

- `WeaponData`: categoría, tipo de daño, material, daño base, velocidad, clases permitidas.
- `OintmentData`: tipo, ingredientes, efecto contra enemigos comunes.
- `BossData`: tabla de eficacia indexada por (material, tipo de daño) con tres valores posibles, el ungüento correcto y qué pistas lo revelan.
- Cálculo (servidor): daño = daño base del arma × multiplicador de eficacia de la tabla del jefe (por material y tipo de daño), solo si el ungüento aplicado es el correcto de ese jefe. Si no lo es, o no hay ungüento, se usa el daño mínimo fijo. Ver "Decisiones tras la revisión".

## Decisiones tras la revisión (mías, a confirmar al leer)

- **Tipo del ungüento:** el tipo del ungüento define cuál es el correcto de cada jefe y qué efecto tiene contra enemigos comunes. La tabla de eficacia del jefe sigue indexada por (material, tipo de daño); no hay tabla de tres dimensiones. El ungüento correcto actúa como interruptor que desbloquea esa tabla.
- **Efecto contra enemigos comunes:** cada ungüento aplica un estado simple (por ejemplo veneno, fuego, sangrado) a enemigos comunes. No hay tabla de eficacia propia por enemigo común.
- **Armas:** se consiguen como objetos del nivel (suelo y cofres). Cada clase empieza con un arma básica. El generador de niveles garantiza que haya al menos un arma por clase que no sea "poco eficaz" contra el jefe del piso.
- **Ingredientes:** van a un inventario compartido del equipo. El generador garantiza ingredientes suficientes para untar las dos armas.
- **Contundente:** se conserva como tipo de daño y se asigna al hacha del Templario. El Cazador no tiene armas contundentes, así que la regla de cobertura se cumple en la tabla de cada jefe, no por tipo.
- **Información de la investigación:** las pistas revelan el ungüento correcto y qué materiales y tipos de daño son fuertes o débiles contra el jefe. La etiqueta de eficacia se muestra después de golpear, y queda registrada en el bestiario.
- **Duración del ungüento (decidido por el usuario):** el ungüento no se gasta por golpes ni por tiempo. Dura hasta que el jefe muere o hasta que el jugador aplica otro ungüento, que reemplaza al anterior. Cada arma guarda un solo ungüento aplicado a la vez.
- **Suelo de daño:** el orden garantizado es sin untar < poco eficaz < normal < muy eficaz. Los valores exactos los afina el constructor.

## Qué se deja al constructor

- Los valores numéricos de cada nivel de eficacia y del daño mínimo.
- La lista final de ingredientes y de recetas.
- La interfaz de la sala de preparación y cómo se muestra la etiqueta de eficacia.
- Cómo se persisten las armas y ungüentos entre partidas, y cómo entran en el linaje de caballeros.
- Cuántas armas lleva cada jugador a la vez y cómo se cambian.
