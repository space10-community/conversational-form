document.addEventListener("DOMContentLoaded", function(){
	setTimeout(function(){
		if(typeof initExample === "function"){
			initExample();
		}
	}, 1000);

	window.addEventListener("hashchange", function() { scrollBy(0, -100) })
});


$(document).ready(function(){
    $("h1,h2,h3,h4,h5,h6").hover(function(){
		if( $(this).find("a").length > 0 ) return;
		$(this).append('<a class="anchorjs" href="#' + $(this).attr("id") + '" data-anchorjs-icon="#"></a>');
	}, function() {	
		$(this).find(".anchorjs").remove();
	})
});