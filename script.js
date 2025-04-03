document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a Elementos Principales ---
    const courseIndexList = document.getElementById('course-index-list');
    const sectionsEditorContainer = document.getElementById('sections-editor-container');
    const courseParamsForm = document.getElementById('course-params-form');
    const completionPercentageSpan = document.getElementById('completion-percentage');

    // Botones Principales
    const addSectionIndexBtn = document.getElementById('add-section-index-btn');
    const addSectionMainBtn = document.getElementById('add-section-main-btn');
    const saveAllBtn = document.getElementById('save-all-changes'); // Asumiendo que existe

    // Modal Checklist
    const checklistModal = document.getElementById('checklist-modal');
    const showChecklistBtn = document.getElementById('show-checklist-btn');
    const closeChecklistBtn = document.getElementById('close-checklist-btn');
    const modalCompletionPercentage = document.getElementById('modal-completion-percentage');
    const modalCompletionStatus = document.getElementById('modal-completion-status');
    const modalChecklistItems = document.getElementById('modal-checklist-items');


    // --- Estado Conceptual (Simulado con un objeto JS) ---
    // Podrías cargar esto desde una API o empezar vacío
    let courseData = {
        title: "Mi Curso Increíble",
        params: {
            hours: 0,
            thumbnail: "",
            coverImage: "",
            description: "",
            categories: "",
            status: "borrador",
            author: ""
        },
        sections: [
            // Ejemplo inicial, podrías empezar vacío
            {
                id: 1,
                title: "Introducción",
                description: "Sección introductoria del curso.",
                lessons: [
                    { id: 11, title: "Bienvenida", contents: [] },
                    { id: 12, title: "Objetivos", contents: [] }
                ]
            },
             {
                id: 2,
                title: "Módulo Principal",
                description: "Contenido denso.",
                lessons: [
                    { id: 21, title: "Concepto Clave", contents: [] }
                ]
            }
        ]
    };

    // --- Inicialización ---
    renderCourse(); // Renderiza todo al cargar

    // --- Manejadores de Eventos Globales ---

    // Clics en el índice
    courseIndexList.addEventListener('click', (event) => {
        const sectionTitle = event.target.closest('.index-section-title');
        const lessonItem = event.target.closest('.index-lesson-list li');

        if (sectionTitle) {
            const sectionId = sectionTitle.parentElement.dataset.sectionId;
            scrollToElement(sectionsEditorContainer.querySelector(`.section-card[data-section-id="${sectionId}"]`));
        } else if (lessonItem) {
            const lessonId = lessonItem.dataset.lessonId;
             scrollToElement(sectionsEditorContainer.querySelector(`.editor-lesson-item[data-lesson-id="${lessonId}"]`));
             // Opcional: Marcar como activo en el índice
             setActiveIndexLesson(lessonId);
        }
    });
    
    // Clics en el editor principal (delegación)
    sectionsEditorContainer.addEventListener('click', (event) => {
        const target = event.target;
        const sectionCard = target.closest('.section-card');
        const lessonItem = target.closest('.editor-lesson-item');

        // Añadir Lección
        if (target.closest('.add-lesson-btn') && sectionCard) {
            const sectionId = parseInt(sectionCard.dataset.sectionId);
            addLesson(sectionId);
        }
        // Editar Título Sección
        else if (target.closest('.edit-section') && sectionCard) {
            const titleElement = sectionCard.querySelector('.card-title');
            enableEditing(titleElement, 'section', parseInt(sectionCard.dataset.sectionId));
        }
        // Eliminar Sección
        else if (target.closest('.delete-section') && sectionCard) {
            deleteSection(parseInt(sectionCard.dataset.sectionId));
        }
         // Editar Título Lección
        else if (target.closest('.edit-lesson') && lessonItem) {
             const titleElement = lessonItem.querySelector('.lesson-item-title');
             const sectionId = parseInt(sectionCard.dataset.sectionId);
             enableEditing(titleElement, 'lesson', parseInt(lessonItem.dataset.lessonId), sectionId);
        }
        // Eliminar Lección
        else if (target.closest('.delete-lesson') && lessonItem) {
            const sectionId = parseInt(sectionCard.dataset.sectionId);
            deleteLesson(sectionId, parseInt(lessonItem.dataset.lessonId));
        }
        // Añadir Contenido (Placeholder)
        else if (target.closest('.add-content-btn') && lessonItem) {
            console.log('Añadir contenido a lección ID:', lessonItem.dataset.lessonId);
            alert('Funcionalidad "Añadir Contenido" no implementada en este ejemplo.');
        }
    });

    // Botones de Añadir Sección
    addSectionIndexBtn.addEventListener('click', addSection);
    addSectionMainBtn.addEventListener('click', addSection);

    // Cambios en el formulario de parámetros
    courseParamsForm.addEventListener('input', (event) => {
        const { name, value, type } = event.target;
        if (name) {
            courseData.params[name] = type === 'number' ? parseInt(value) || 0 : value;
            // console.log('Parámetros actualizados:', courseData.params);
            updateCompletion(); // Recalcular progreso al cambiar params
        }
    });
    
    // Modal Checklist
    showChecklistBtn.addEventListener('click', openChecklistModal);
    closeChecklistBtn.addEventListener('click', closeChecklistModal);
    checklistModal.addEventListener('click', (event) => { // Cerrar si se hace clic fuera
        if (event.target === checklistModal) {
            closeChecklistModal();
        }
    });

    // --- Funciones de Renderizado ---

    function renderCourse() {
        document.getElementById('course-title-main').textContent = courseData.title;
        renderIndex();
        renderEditor();
        renderParams();
        updateCompletion();
    }

    function renderIndex() {
        courseIndexList.innerHTML = ''; // Limpiar índice
        courseData.sections.forEach(section => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'index-section';
            sectionDiv.dataset.sectionId = section.id;
            
            const titleSpan = document.createElement('span');
            titleSpan.className = 'index-section-title';
            titleSpan.textContent = section.title || 'Sección sin título';
            sectionDiv.appendChild(titleSpan);

            const lessonList = document.createElement('ul');
            lessonList.className = 'index-lesson-list';
            section.lessons.forEach(lesson => {
                const lessonLi = document.createElement('li');
                lessonLi.dataset.lessonId = lesson.id;
                lessonLi.textContent = lesson.title || 'Lección sin título';
                lessonList.appendChild(lessonLi);
            });
            sectionDiv.appendChild(lessonList);
            courseIndexList.appendChild(sectionDiv);
        });
    }

    function renderEditor() {
        sectionsEditorContainer.innerHTML = ''; // Limpiar editor
        courseData.sections.forEach(section => {
            const card = document.createElement('div');
            card.className = 'editor-card section-card';
            card.dataset.sectionId = section.id;
            card.innerHTML = `
                <div class="card-header">
                    <h3 class="card-title" contenteditable="false">${section.title || 'Sección sin título'}</h3>
                    <div class="card-actions">
                        <button class="btn-icon edit-section" title="Editar Título"><i class="fas fa-pencil-alt"></i></button>
                        <button class="btn-icon delete-section" title="Eliminar Sección"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <div class="card-content">
                    <p class="section-description">${section.description || ''}</p> 
                    <button class="btn btn-outline add-lesson-btn"><i class="fas fa-plus"></i> Agregar Lección</button>
                    <ul class="editor-lesson-list">
                        ${section.lessons.map(lesson => `
                            <li class="editor-lesson-item" data-lesson-id="${lesson.id}">
                                <div class="lesson-item-header">
                                    <span class="lesson-item-title" contenteditable="false">📘 ${lesson.title || 'Lección sin título'}</span>
                                    <div class="lesson-item-actions">
                                        <button class="btn-icon edit-lesson" title="Editar Título"><i class="fas fa-pencil-alt"></i></button>
                                        <button class="btn-icon delete-lesson" title="Eliminar Lección"><i class="fas fa-trash-alt"></i></button>
                                    </div>
                                </div>
                                <button class="btn btn-ghost add-content-btn"><i class="fas fa-plus"></i> Agregar Contenido</button> 
                            </li>
                        `).join('')}
                    </ul>
                </div>`;
            sectionsEditorContainer.appendChild(card);
        });
         // Añadir campo de descripción editable (si se necesita)
         // Por simplicidad, aquí solo se muestra. La edición podría ser un textarea en el modal o aquí.
    }

    function renderParams() {
         for (const key in courseData.params) {
            const input = courseParamsForm.elements[key];
            if (input) {
                 input.value = courseData.params[key];
            }
        }
    }


    // --- Funciones de Acción ---

    function addSection() {
        const newSection = {
            id: Date.now(), // ID único simple
            title: "Nueva Sección",
            description: "",
            lessons: []
        };
        courseData.sections.push(newSection);
        renderCourse(); // Re-renderizar todo
         // Opcional: scroll a la nueva sección y activar edición
         const newCard = sectionsEditorContainer.querySelector(`.section-card[data-section-id="${newSection.id}"]`);
         scrollToElement(newCard);
         enableEditing(newCard.querySelector('.card-title'), 'section', newSection.id);
    }

    function addLesson(sectionId) {
        const section = courseData.sections.find(s => s.id === sectionId);
        if (!section) return;

        const newLesson = {
            id: Date.now(),
            title: "Nueva Lección",
            contents: []
        };
        section.lessons.push(newLesson);
        renderCourse(); // Re-renderizar
         // Opcional: scroll y activar edición
        const newLessonItem = sectionsEditorContainer.querySelector(`.editor-lesson-item[data-lesson-id="${newLesson.id}"]`);
        scrollToElement(newLessonItem);
        enableEditing(newLessonItem.querySelector('.lesson-item-title'), 'lesson', newLesson.id, sectionId);
    }
    
     function deleteSection(sectionId) {
        const section = courseData.sections.find(s => s.id === sectionId);
        if (confirm(`¿Eliminar sección "${section?.title || 'esta'}" y todas sus lecciones?`)) {
             courseData.sections = courseData.sections.filter(s => s.id !== sectionId);
            renderCourse();
        }
    }

    function deleteLesson(sectionId, lessonId) {
        const section = courseData.sections.find(s => s.id === sectionId);
        if (!section) return;
        const lesson = section.lessons.find(l => l.id === lessonId);
         if (confirm(`¿Eliminar lección "${lesson?.title || 'esta'}"?`)) {
            section.lessons = section.lessons.filter(l => l.id !== lessonId);
            renderCourse();
        }
    }

    function enableEditing(element, type, id, parentId = null) {
        element.contentEditable = 'true';
        element.focus();
        // Seleccionar texto para edición rápida
        document.execCommand('selectAll', false, null); 

        const saveEdit = () => {
            element.contentEditable = 'false';
            const newTitle = element.textContent.trim();
            updateTitle(newTitle, type, id, parentId); // Actualiza el objeto de datos
            renderCourse(); // Re-renderiza para asegurar consistencia
            element.removeEventListener('blur', saveEdit);
            element.removeEventListener('keydown', handleKeyDown);
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                element.contentEditable = 'false'; // Cancela sin guardar cambios en DOM (se restaurará al re-renderizar)
                element.removeEventListener('blur', saveEdit);
                element.removeEventListener('keydown', handleKeyDown);
                renderCourse(); // Re-renderizar para restaurar título original
            }
        };

        element.addEventListener('blur', saveEdit);
        element.addEventListener('keydown', handleKeyDown);
    }
    
    function updateTitle(newTitle, type, id, sectionId = null) {
         if (type === 'section') {
             const section = courseData.sections.find(s => s.id === id);
             if (section) section.title = newTitle;
         } else if (type === 'lesson' && sectionId) {
             const section = courseData.sections.find(s => s.id === sectionId);
             const lesson = section?.lessons.find(l => l.id === id);
             if (lesson) lesson.title = newTitle;
         }
         console.log("Datos actualizados:", courseData);
         // Aquí podrías añadir una llamada a API para guardar
    }


    // --- Funciones Auxiliares ---
    function scrollToElement(element) {
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
             // Opcional: añadir un efecto visual temporal
            element.style.transition = 'background-color 0.5s ease';
            element.style.backgroundColor = 'rgba(13, 110, 253, 0.1)'; // Azul claro suave
            setTimeout(() => {
                 element.style.backgroundColor = ''; // Quitar el fondo después de un tiempo
            }, 1000);
        }
    }
    
    function setActiveIndexLesson(activeLessonId) {
         // Quitar clase activa de cualquier otra lección
         courseIndexList.querySelectorAll('.index-lesson-list li.active')
            .forEach(li => li.classList.remove('active'));
        // Añadir clase activa a la lección seleccionada
         const activeLi = courseIndexList.querySelector(`.index-lesson-list li[data-lesson-id="${activeLessonId}"]`);
         if (activeLi) {
            activeLi.classList.add('active');
        }
    }
    
    // --- Funciones Checklist y Progreso ---
    function calculateCompletion() {
         let itemsDone = 0;
         let itemsTotal = 0;
         const checklist = []; // Array para los items del modal

         // Parámetros: Contar los que no están vacíos/cero
         const paramKeys = ['hours', 'thumbnail', 'coverImage', 'description', 'categories', 'author'];
         paramKeys.forEach(key => {
             const value = courseData.params[key];
             const isDone = (key === 'hours') ? value > 0 : (value && value.trim() !== '');
             checklist.push({ text: `Parámetro: ${key}`, done: isDone });
             if (isDone) itemsDone++;
             itemsTotal++;
         });

         // Secciones: Solo contar que existen
         courseData.sections.forEach(section => {
             checklist.push({ text: `Sección: ${section.title || '(sin título)'}`, done: true });
             itemsDone++;
             itemsTotal++;

             // Lecciones: Solo contar que existen
             section.lessons.forEach(lesson => {
                 checklist.push({ text: `Lección: ${lesson.title || '(sin título)'}`, done: true });
                 itemsDone++;
                 itemsTotal++;
                 // Podrías añadir lógica para contenidos aquí si los tuvieras
                 // lesson.contents.forEach(content => { ... });
             });
         });

         const percentage = (itemsTotal === 0) ? 0 : Math.round((itemsDone / itemsTotal) * 100);
         return { percentage, checklist };
    }

    function updateCompletion() {
         const { percentage } = calculateCompletion();
         completionPercentageSpan.textContent = `${percentage}%`;
         // Actualizar también el del modal si está abierto
         modalCompletionPercentage.textContent = `${percentage}%`;
         modalCompletionStatus.textContent = percentage === 100 ? 'Completo' : 'Incompleto';
    }

    function renderChecklist() {
         const { percentage, checklist } = calculateCompletion();
         modalCompletionPercentage.textContent = `${percentage}%`;
         modalCompletionStatus.textContent = percentage === 100 ? 'Completo' : 'Incompleto';
         
         modalChecklistItems.innerHTML = ''; // Limpiar lista
         checklist.forEach(item => {
             const li = document.createElement('li');
             li.textContent = item.text;
             li.className = item.done ? 'checklist-item-done' : 'checklist-item-pending';
             modalChecklistItems.appendChild(li);
         });
    }

    function openChecklistModal() {
        renderChecklist(); // Asegura que el contenido esté actualizado
        checklistModal.style.display = 'flex';
    }

    function closeChecklistModal() {
        checklistModal.style.display = 'none';
    }


    const userProfileButton = document.getElementById('user-profile-button');
    const userDropdownMenu = document.getElementById('user-dropdown-menu');

    if (userProfileButton && userDropdownMenu) {
        userProfileButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Evita que el clic se propague al listener del documento
            const isExpanded = userProfileButton.getAttribute('aria-expanded') === 'true';
            
            // Toggle (Mostrar/Ocultar)
            userDropdownMenu.classList.toggle('show');
            userProfileButton.setAttribute('aria-expanded', !isExpanded);
        });

        // Cerrar el menú si se hace clic fuera de él
        document.addEventListener('click', (event) => {
            // Si el menú está visible Y el clic NO fue dentro del botón O dentro del menú
            if (userDropdownMenu.classList.contains('show') && 
                !userProfileButton.contains(event.target) && 
                !userDropdownMenu.contains(event.target)) 
            {
                userDropdownMenu.classList.remove('show');
                userProfileButton.setAttribute('aria-expanded', 'false');
            }
        });

        // Opcional: Cerrar el menú si se presiona la tecla Escape
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && userDropdownMenu.classList.contains('show')) {
                 userDropdownMenu.classList.remove('show');
                 userProfileButton.setAttribute('aria-expanded', 'false');
            }
        });

        // Cargar datos del usuario (ejemplo)
        // En una aplicación real, obtendrías esto del backend/autenticación
        const userNameElement = document.getElementById('user-name');
        const userAvatarElement = document.getElementById('user-avatar');
        
        // Simulación:
        const loggedInUserName = "Andrés Pérez"; // Reemplaza con el nombre real
        const loggedInUserAvatar = "https://placehold.co/600x400"; // URL real o placeholder

        if (userNameElement) userNameElement.textContent = loggedInUserName;
        if (userAvatarElement) userAvatarElement.src = loggedInUserAvatar; 
        
    }


}); // Fin del DOMContentLoaded