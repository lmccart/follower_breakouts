let app = firebase.app();
firebase.auth().signInAnonymously().catch(function(error) { console.log(error); });
firebase.auth().onAuthStateChanged(function(user) { });
db = firebase.firestore(app);

const urlParams = new URLSearchParams(window.location.search);
const roomid = Number(urlParams.get('id'));
$('h2').text('Breakout Room '+roomid);

$('#generate').on('click', generate);

db.collection('people').where("room", "==", roomid)
  .get()
  .then(function(snapshot) {
    snapshot.forEach(function(doc) {
      console.log(doc.id, " => ", doc.data());
      displayPerson(doc.data());
    });
    displayPerson({});
  });

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
    alert('Please enter your name in the facilitator box!') 
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

  for (let p=0; p <people.length; p+=2) {
    let a = people[p];
    let texta = 'Please hold the following name in your mind. You will be instructed what to do with it shortly: ' + a;
    let b = people[p+1];
    let textb = 'Please hold the following name in your mind. You will be instructed what to do with it shortly: ' + b;
    $('#messages').append('<div id="clip'+p+'" class="message"><span class="instruct"><b>Send to '+a+':</b><br>'+textb+'<img src="clip.png" class="clipicon"></span> <span class="copied">copied!</span></div>');
    $('#messages').append('<div id="clip'+(p+1)+'" class="message"><span class="instruct"><b>Send to '+b+':</b><br>'+texta+'<img src="clip.png" class="clipicon"></span> <span class="copied">copied!</span></div>');
    $('#clip'+p).click(function() { copyToClipboard($(this), textb); });
    $('#clip'+(p+1)).click(function() { copyToClipboard($(this), texta); });
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