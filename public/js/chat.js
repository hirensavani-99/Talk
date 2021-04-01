
const socket = io()

//Element
const $messageForm = document.getElementById('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocation = document.getElementById('#send-locattion')
const $messages = document.getElementById('#messages')


//Template
const messageTemplate = document.getElementById('#message-template').innerHTML
const locationTemplate = document.getElementById('#location-template').innerHTML
const sidebarTemplate = document.getElementById('#sidebar-template').innerHTML



//OPtions
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffSet = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffSet) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('welcomeMessage', (message) => {

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)

    autoscroll()
})

socket.on('locationMessage', (url) => {
    const html = Mustache.render(locationTemplate, {
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on("roomData", ({ room, users }) => {

    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.getElementById('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = document.querySelector('input').value
    socket.emit('sendmessage', message, (error) => {


        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {

            return console.log(error);
        }

        console.log('message delivered!');
    })
})

$sendLocation.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocation.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }
        socket.emit('sendlocation', location, () => {
            $sendLocation.removeAttribute('disabled')
            console.log('Location shared');
        })
    })
})


socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
