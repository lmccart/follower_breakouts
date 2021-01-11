let app = firebase.app();
firebase.auth().signInAnonymously().catch(function(error) { console.log(error); });
firebase.auth().onAuthStateChanged(init);

const urlParams = new URLSearchParams(window.location.search);
const roomid = Number(urlParams.get('id'));
$('h2').text('Breakout Room '+roomid);


function init() {
  $('#attendance').show();
  $('#generate').on('click', generate);
  
  db = firebase.firestore(app);
  db.collection('people').where("room", "==", roomid)
    .get()
    .then(function(snapshot) {
      snapshot.forEach(function(doc) {
        console.log(doc.id, " => ", doc.data());
        displayPerson(doc.data());
      });
      displayPerson({});
      checkFacilitator();
    });
}

function displayPerson(data) {
  if (data.facilitator) {
    $('#facilitator').val(data.name);
    $('#facilitator').data('id', data.id);
    $('#facilitator').data('facilitator', true);
    $('#facilitator').on('change', nameAndCheckBlank);
  } else {
    let elm = $('<div class="person"><input type="text" class="name participant" ></div>');
    let dataid = data.id ? data.id : makeid();
    elm.find('input').attr('data-id', dataid);
    if (data.name) elm.find('input').val(data.name);
  
    $('#people').append(elm);
    elm.find('input').focus();

    elm.find('input').on('change', nameAndCheckBlank);
    elm.find('input').bind('keypress', function(event) {
      if(event.which === 13) {
        $(this).parent().next().find('input').focus();
      }
    });
  }
}

function checkFacilitator() {
  if (!$('#facilitator').val()) {
    $('#facilitator').data('id', makeid());
    $('#facilitator').data('facilitator', true);
    $('#facilitator').on('change', nameAndCheckBlank);
  }
}

function checkBlank() {
  let blank = false;
  $('.participant').each(function(i, obj) {
    if ($(obj).val().length === 0) {
      blank = true;
    }
  });
  if (!blank) {
    displayPerson({});
  }
}

function nameAndCheckBlank(e) {
  console.log('hi')
  $('#assignments').hide();
  let p = {
    name: $(e.target).val(),
    id: $(e.target).data('id'),
    facilitator: Boolean($(e.target).data('facilitator')),
    room: roomid
  };

  console.log(p);
  if (p.name) {
    db.collection('people').doc(p.id).set(p);
  } else {
    db.collection('people').doc(p.id).delete();
  }
  checkBlank();
}

function generate() {
  if (!$('#facilitator').val()) {
    alert('Please enter your name in the facilitator box') 
    return false;
  }

  $('#assignments').show();
  let people = [];
  let elts = $('input').filter(function() { return this.value.length !== 0; });
  console.log(elts)
  elts.each(function(i, obj) {
    if (elts.length % 2 == 0 || !$(obj).data('facilitator')) {
      people.push($(obj).val())
    }
  });
  people = shuffle(people);
  console.log(people)
  displayAssignments(people);
}

function displayAssignments(people) {
  $('#messages').empty();
  $('#sorry').hide();
  
  if (people.length < 2) {
    $('#sorry').show();
    return;
  }

  let elms = [];

  for (let p=0; p <people.length; p+=2) {
    let a = people[p];
    let texta = 'Please hold the following name in your mind. You will be instructed what to do with it shortly: ' + a;
    let b = people[p+1];
    let textb = 'Please hold the following name in your mind. You will be instructed what to do with it shortly: ' + b;
    
    let elm1 = $('<div class="message" data-name="'+a+'"><span class="instruct"><b>Send to '+a+':</b><br>'+textb+'<img src="clip.png" class="clipicon"></span> <span class="copied">copied!</span></div>');
    let elm2 = $('<div class="message" data-name="'+b+'"><span class="instruct"><b>Send to '+b+':</b><br>'+texta+'<img src="clip.png" class="clipicon"></span> <span class="copied">copied!</span></div>');
    
    elm1.click(function() { copyToClipboard($(this), textb); });
    elm2.click(function() { copyToClipboard($(this), texta); });
    
    elms.push(elm1);
    elms.push(elm2);
  }

  elms = elms.sort(function(a, b) {
    console.log($(a).data('name'), $(b).data('name'), $(a).data('name') < $(b).data('name'));
    return $(a).data('name') < $(b).data('name') ? -1 : 1;
  })
  console.log(elms)
  for (let e of elms) {
    $('#messages').append(e);
  }
}

function shuffle(xs) {
  return xs.slice(0).sort(function() {
    return .5 - Math.random();
  });
}

function copyToClipboard(elem, text) {
  $(elem).find('.copied').fadeIn(0).delay(1000).fadeOut(0);
  let $temp = $('<input>');
  $('body').append($temp);
  $temp.val(text).select();
  document.execCommand('copy');
  $temp.remove();
}

function makeid() {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < 6; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  result += Date.now();
  return result;
}