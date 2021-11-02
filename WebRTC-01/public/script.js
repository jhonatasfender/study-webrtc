const socket = io('/')
const peer = new Peer(undefined, {
  host: '/',
  port: '3001',
})

const videoGrid = document.querySelector('#video-grid')
const video = document.createElement('video')
video.muted = true

navigator.mediaDevices &&
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
    })
    .then((stream) => {
      addVideoStream(video, stream)

      peer.on('call', (call) => {
        call.answer(stream)

        const video = document.createElement('video')
        video.muted = true
        call.on('stream', (userVideoStream) => {
          addVideoStream(video, userVideoStream)
        })
      })

      socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream)
      })
    })

peer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream)

  const video = document.createElement('video')
  video.muted = true
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })

  videoGrid.append(video)
}
