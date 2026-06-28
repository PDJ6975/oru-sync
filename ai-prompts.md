# GRDB - AppDatabase.swift

Eres un Ingeniero de Software experto con experiencia en el desarrollo de aplicaciones cliente-servidor. Tus respuestas promueven enfoques funcionales sencillos (KISS) que siguen las buenas prácticas de la programación (DRY, YAGNI, etc.), fomentando la mantenibilidad y evitando la deuda técnica. Tras instalar GRDB en el cliente, me gustaría configurarlo en el archivo AppDatabase siguiendo la guía oficial. No obstante, me surgen algunas dudas sobre el funcionamiento del pool ofrecido y la diferencia. ¿Por qué utilizar `DatabaseWriter` sobre `DatabasePool` o `DatabaseQueue`? Además, no encuentro cómo poder crear carpetas dentro del sistema de ficheros de Apple. Quiero que consultes la documentación oficial y que trates de responder a las preguntas con el contenido devuelto. ¿Lo has entendido? _use context7._

---

# Disparadores - SyncCoordinator.swift

Eres un Ingeniero de Software experto con experiencia en el desarrollo de aplicaciones cliente-servidor. Tus respuestas promueven enfoques funcionales sencillos (KISS) que siguen las buenas prácticas de la programación (DRY, YAGNI, etc.), fomentando la mantenibilidad y evitando la deuda técnica. Ahora que ya he implementado la lógica de sincronización entre el cliente y la base de datos utilizando el archivo `SyncEngine`, me gustaría elaborar el coordinador que dispara el push. Para ello, tengo que implementar tres eventos disparadores: el arranque de la app, cada mutación local y la reconexión. El problema es que no encuentro cómo Apple detecta los cambios de estado en la red del dispositivo, ni tampoco cómo podría usarse dentro de una función. Quiero que consultes la documentación oficial y que trates de responder a las preguntas con el contenido devuelto. ¿Lo has entendido? _use context7._

---

# Sintaxis

Eres un Ingeniero de Software experto con experiencia en el desarrollo de aplicaciones cliente-servidor. Tus respuestas promueven enfoques funcionales sencillos (KISS) que siguen las buenas prácticas de la programación (DRY, YAGNI, etc.), fomentando la mantenibilidad y evitando la deuda técnica. Me gustaría resolver una duda sobre el manejo de hilos en Swift. Al utilizar GRDB, el compilador me exige que las estructuras relacionadas no se ejecuten sobre el `MainActor`. El problema es que no sé si las estructuras como los `struct` se pueden marcar para ejecutarse fuera del hilo principal y cómo hacerlo. El objetivo es que el warning del compilador desaparezca. Quiero que consultes la documentación oficial y que trates de responder a las preguntas con el contenido devuelto. ¿Lo has entendido? _use context7._

---

> **Nota:** Aquí se representan algunos de los prompts relevantes realizados durante la ejecución del proyecto. Algunos no se incluyen por ser muy puntuales y específicos, relacionados con dudas de sintaxis concretas con el objetivo de mejorar el conocimiento en el lenguaje de desarrollo empleado en el cliente.
