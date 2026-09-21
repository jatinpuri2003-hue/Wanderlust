// Function to handle delete confirmation

function confirmDelete(event){
    const userConfirmed = confirm("Are you sure you want to permanently delete this chat?");


// if user clicks 'cancel, prevent the form from submitting
if(!userConfirmed){
    event.preventDefault();
}
}