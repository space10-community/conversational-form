document.addEventListener("DOMContentLoaded", function(){
	setTimeout(function(){
		if(typeof initExample === "function"){
			initExample();
		}
	}, 1000);
});