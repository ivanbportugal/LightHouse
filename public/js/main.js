
$("form").submit(function(e){
	e.preventDefault();

	var dataString = $("#theForm").serialize();
 	
	// if (!$(".control-group").hasClass("error")){
		// $(".alert-error").stop().hide();
		// $(".alert-warning").stop().hide();
		// $(".alert-success").stop().hide();
		$.ajax({
			type: "POST",
			url: "/activate",
			data: dataString,
			success: function(data, textStatus, jqXHR){
				// if(data.indexOf("1") >= 0){
				// 	// Message sent
				// 	$(".alert-success").show();
				// } else {
				// 	// Message not sent
				// 	$(".alert-warning").show();
				// }
				$(".alert-message").fadeIn(500, function(){
					setTimeout(function(){
						$(".alert-message").fadeOut(500);
					}, 5000);
				});
			}
		});
		// isAlreadySubmitted = true;
		// return true;
	// } else{
		// $(".alert-error").show();
	// }
});