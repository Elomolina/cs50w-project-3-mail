document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // By default, load the inbox
  load_mailbox('inbox');


});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-detail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3 id="mailbox">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  get_mailbox()
}
function get_mailbox() {
  let email_view = document.getElementById("emails-view");
  let mailbox = document.getElementById("mailbox").innerText
  mailbox = mailbox.toLowerCase()
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      emails.forEach(email => {
        //console.log(email);

        let div = document.createElement("div")
        let input = document.createElement("input");
        input.type = 'hidden';
        input.name = 'id';
        input.value = email.id
        let div_date = document.createElement("div");
        let div_info = document.createElement("div");
        div.classList.add('email')
        let sender = document.createElement("h3")
        let subject = document.createElement("h4")
        let timestamp = document.createElement("h5")
        sender.innerHTML = email.sender;
        subject.innerHTML = email.subject;
        timestamp.innerHTML = email.timestamp
        //email not read
        if (!email.read) {
          div.style.backgroundColor = 'white';
        }
        else {
          div.style.backgroundColor = '#C7C8CC'
        }
        div_info.appendChild(sender);
        div_info.appendChild(subject),
          div_date.appendChild(timestamp);
        div.appendChild(div_info);
        div.appendChild(div_date);
        div.appendChild(input);
        email_view.style.display = 'flex';
        email_view.style.flexDirection = 'column';
        email_view.style.gap = '1em';
        email_view.appendChild(div);

      })

    })
    .then(() => {
      let emails = document.querySelectorAll(".email");
      emails.forEach(email => {
        email.addEventListener('click', () => {
          email_children = email.children;
          id = email_children[2].value;
          openEmail(id)
        })

      })

    })

}

function openEmail(id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  let email_detail = document.querySelector('#email-detail');
  email_detail.style.display = 'block';
  let h2 = document.createElement("h2");
  h2.innerText = 'Detail email';
  email_detail.innerHTML = ''
  email_detail.appendChild(h2);

  //fetch but now a PUT request
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
  //fetch data
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      let sender = document.createElement("h4");
      let recipients = document.createElement("h4");
      let subject = document.createElement("h4");
      let timestamp = document.createElement("h4");
      let body = document.createElement("p");
      let div = document.createElement("div");
      let reply = document.createElement("button");
      reply.innerText = "Reply";
      reply.classList.add("reply");
      reply.addEventListener("click", () => {
        reply_view(email);
      });
      div.classList.add("email_information");
      sender.innerText = `From: ${email.sender}`;
      recipients.innerText = `To: ${email.recipients}`;
      subject.innerText = `Subject: ${email.subject}`;
      body.innerText = `${email.body}`;
      body.classList.add("body_email");
      timestamp.innerText = `Timestamp: ${email.timestamp}`;
      div.appendChild(sender);
      div.appendChild(recipients);
      div.appendChild(subject);
      div.appendChild(timestamp);
      email_detail.appendChild(div);
      email_detail.appendChild(reply);
      email_detail.appendChild(document.createElement("hr"));
      email_detail.appendChild(body);
      let mailbox = document.getElementById("mailbox").innerText;
      if(mailbox != "Sent")
      {
        let archived = document.createElement("button");
        if (email.archived) 
        {
          archived.innerText = "Unarchived";
        }
        else 
        {
          archived.innerText = "Archived";
        }
        archived.classList.add("reply");
        archived.classList.add("archived");
        archived.addEventListener("click", () => {
          archived_email(email, archived.innerText);
        })
        email_detail.appendChild(archived);
      }
    })
}
function reply_view(email) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-detail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  let compose_recipients = document.getElementById("compose-recipients");
  let compose_subject = document.getElementById("compose-subject");
  let compose_body = document.getElementById("compose-body");
  compose_recipients.value = email.sender;
  if (email.subject.includes("Re:")) {
    compose_subject.value = `${email.subject}`;
  }
  else {
    compose_subject.value = `Re: ${email.subject}`;
  }
  body = `On ${email.timestamp}, ${email.sender} wrote: ${email.body}`
  compose_body.value = body;
}
function archived_email(email, archived)
{
  if(archived == "Archived")
  {
    //put to archived email
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
    .then(() => 
    {
      document.querySelector('#inbox').click();
    });
  }
  else 
  {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
    .then(() =>
    {
      document.querySelector('#inbox').click();
    });
  }
  
}

let compose_form = document.getElementById('compose-form');
let compose_recipients = document.getElementById('compose-recipients');
let compose_subject = document.getElementById('compose-subject');
let compose_body = document.getElementById('compose-body');

compose_form.addEventListener('submit', (e) => {
  e.preventDefault()
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
        .then(response => response.json())
        .then(() => {
            load_mailbox('sent')

        })
})
