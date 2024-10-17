let compose_form = document.getElementById('compose-form');
let compose_recipients = document.getElementById('compose-recipients');
let compose_subject = document.getElementById('compose-subject');
let compose_body = document.getElementById('compose-body');

compose_form.addEventListener('submit', () => {
    fetch('/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {
                recipients: compose_recipients.value,
                subject: compose_subject.value,
                body: compose_body.value
            }
        )
    })
        .then(response => response.json)
        .then(result => {
            console.log(result);

        })
})

