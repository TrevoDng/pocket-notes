(function () {
  var notes_container = document.querySelector('.notes-container');
  var localstorage = Boolean(localStorage);


  var NOTES = {
    lastNoteID: -1,
    notes: {},
    save: function (id, value) {
      if (value.markdown === '') return;
      this.notes[id] = value;
      localStorage.setItem('pocket-notes', JSON.stringify(NOTES));
    },
    delete: function (id) {
      delete this.notes[id];
      NOTES.lastNoteID -= 1;
      localStorage.setItem('pocket-notes', JSON.stringify(NOTES));
    }
  }

  function getDate() {
    var now = new Date().toUTCString().split(' ');
    now.pop();
    now.pop();
    now = now.join(' ');

    return now;
  }

  function formatDate(dateString) {
    return '<span style="margin:10px 0; padding-bottom:7.5px;border-bottom:1px solid;">' + dateString + '</span>'
  }

  function template(data) {

    var colors = ['blue', 'yellow', 'green', 'pink', 'light', 'dark'];
    var id = data.id || ("pocket-notes-" + (++NOTES.lastNoteID));
    var markdown = data.value ? data.value.markdown : '';

    var html = `<div class="notes-component" id="${id}" data-color="${colors[Math.floor(Math.random() * (5 - 0 + 1)) + 0]}" data-state="view">
          <div class="notes-header">
            <i class="fa fa-plus new-note"></i>
            <input type="text" placeholder="Title" value="Pocket Note" />
            <i class="fa fa-pen edit"></i>
            <i class="fa fa-trash delete"></i>
            <i class="fa fa-ellipsis-v more"></i>
            <i class="fa fa-save save"></i>
            <i class="fa fa-times cancel"></i>
            <section class="color-palette">
              <div data-color="green"></div>
              <div data-color="blue"></div>
              <div data-color="yellow"></div>
              <div data-color="pink"></div>
              <div data-color="light"></div>
              <div data-color="dark"></div>
              <div class="set-color"><i class="fa fa-check"></i></div>
            </section>
          </div>
          <div class="notes-content">
            <textarea class="markdown" wrap="soft" placeholder="Welcome to Pocket Note!...">${markdown}</textarea>
            <div class="html"></div>
          </div>
        </div>`;
    var tempDOM = document.createElement('div');

    tempDOM.innerHTML = html;

    return tempDOM.firstElementChild;
  };

  function createNote(data = {}) {
    var notes_component = template(data);

    var textarea = notes_component.querySelector('.markdown');
    var domElement = notes_component.querySelector('.html');

    domElement.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightBlock(block);
    });

    var id = notes_component.id;

    var new_note = notes_component.querySelector('.new-note');
    var edit = notes_component.querySelector('.edit');
    var _delete = notes_component.querySelector('.delete');
    var more = notes_component.querySelector('.more');
    var save = notes_component.querySelector('.save');
    var cancel = notes_component.querySelector('.cancel');
    var color_palette = notes_component.querySelector('.color-palette');
    var colors = notes_component.querySelectorAll('.color-palette > div:not(.set-color)');
    var set_color = notes_component.querySelector('.set-color');

    var previous_value = textarea.value.trim();

    var markdown = textarea.value.trim();
    var html = marked(markdown);
    var now = data.value ? data.value.createdOn : getDate();
    domElement.innerHTML = formatDate(now) + html;

    new_note.addEventListener('click', createNote);

    edit.addEventListener('click', function (e) {
      previous_value = textarea.value.trim();
      notes_component.setAttribute('data-state', 'edit');
      textarea.focus();
    })

    save.addEventListener('click', function (e) {
      notes_component.setAttribute('data-state', 'view');
      markdown = textarea.value.trim();
      html = marked(markdown);
      now = getDate();
      domElement.innerHTML = formatDate(now) + html;

      var value = {
        markdown: markdown,
        createdOn: now
      }

      NOTES.save(id, value);

      domElement.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
      });
    })

    cancel.addEventListener('click', function (e) {
      notes_component.setAttribute('data-state', 'view');
      textarea.value = previous_value;
    })

    _delete.addEventListener('click', function (e) {

      NOTES.delete(id);
      notes_container.removeChild(notes_component);
      if (notes_container.childElementCount === 0) {
        createNote();
      }
    })

    more.addEventListener('click', function () {
      color_palette.classList.add('active');
    });

    set_color.addEventListener('click', function () {
      color_palette.classList.remove('active');
    });

    colors.forEach(function (color) {
      color.addEventListener('click', function (e) {
        var selected = e.target.attributes[0].value;
        notes_component.setAttribute('data-color', selected);
      })
    })

    notes_container.prepend(notes_component);

    return notes_component;
  }

  window.onload = function () {

    var wh = window.innerHeight;
    var header = window.getComputedStyle(document.querySelector('header')).height;
    var footer = window.getComputedStyle(document.querySelector('footer')).height;
    notes_container.style.height = wh - (parseInt(header) + parseInt(footer)) + 'px';

    if (!localstorage) {
      alert("Notes can't be saved in your browser.");
    }
    else {
      console.log('localstorage available');
      var data = JSON.parse(window.localStorage.getItem('pocket-notes'));

      if (data) {
        NOTES.lastNoteID = data.lastNoteID;
        NOTES.notes = data.notes;
        Object.keys(NOTES.notes).forEach(function (note) {
          createNote({
            id: note,
            value: NOTES.notes[note]
          });
        })

        if (Object.keys(NOTES.notes).length === 0) {
          createNote();
        }

      } else {
        createNote();
      }
    }
  };
})()