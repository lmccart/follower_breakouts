let app = firebase.app();
firebase.auth().signInAnonymously().catch(function(error) { console.log(error); });
firebase.auth().onAuthStateChanged(function(user) { });
db = firebase.firestore(app);

db.collection('rooms').orderBy("ts", "desc").limit(1)
  .get()
  .then(function(snapshot) {
    snapshot.forEach(function(doc) {
      console.log(doc.id, " => ", doc.data());
      displayRooms(doc.data());
    });
  });


function displayRooms(data) {
  let i = 0;
  for (let key in data) {
    if (data[key].paired) {
      console.log(data[key])
      $('body').append('<h1>'+key+'</h1>');
      $('body').append('<table id="room'+i+'"><tbody></tbody></table>');

      for (let p=0; p <data[key].paired.length; p+=2) {
        let a = data[key].paired[p];
        let b = data[key].paired[p+1];
        $('#room'+i+' tbody').append('<tr><td id="clip'+p+'">'+a+'<img src="clip.png"></td><td id="clip'+(p+1)+'">'+b+'<img src="clip.png"></td></tr>');
        $('#room'+i+' #clip'+p).click(function() { copyToClipboard(a); });
        $('#room'+i+' #clip'+(p+1)).click(function() { copyToClipboard(b); });
      }
      i++;
    }
  }
}

function copyToClipboard(text) {
  console.log(text)
  let $temp = $("<input>");
  $("body").append($temp);
  $temp.val(text).select();
  document.execCommand("copy");
  $temp.remove();
}