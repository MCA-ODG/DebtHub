<?php $name = $_POST['name'];
	$email = $_POST['email'];
	$message = $_POST['message'];
	$url = $_POST ['url'];
	$formcontent="From: $name \n Message: $message";
	$recipient = "marc.giaoxuan@gmail.com";
	$subject = "Contact Form";
	$mailheader = "From: $email \r\n";
	mail($recipient, $subject, $formcontent, $mailheader) or die("Error!");
	echo "Thanks!!";
	?>