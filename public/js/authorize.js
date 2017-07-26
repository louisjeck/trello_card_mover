/* global TrelloPowerUp */


var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();


var authNode = document.getElementById('authNode');







t.render(function(){
  

  return t.board('id').get('id')


  .then(function(model){

    authNode.href="https://card-mover.glitch.me/auth?model="+model;
    t.sizeTo('#content')
    })

})
