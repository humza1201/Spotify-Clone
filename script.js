
let currentSong = new Audio();
let songs;
let currFolder;
async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    //show all songs in the playlist
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML += `<li> <i class="fa-solid fa-music"></i>
                            <div class="information">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Humza</div>
                            </div>
                            <div class="playnow">
                                <span>play now</span>
                                <i class="fa-solid fa-play"></i>
                            </div>
                        </li>`;
    }

    //attach an event listener to each song
    Array.from(document.querySelectorAll(".songList li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".information").firstElementChild.innerHTML.trim());
        });
    });

    return songs;
}

const playMusic = (track) => {
    // let audio = new Audio("/songs/" + track);
    currentSong.src = `/${currFolder}/` + track;

    currentSong.play();

    pause.classList.remove("fa-play");
    pause.classList.add("fa-pause");

    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = `00:00 / 00:00`;


}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];

            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json();

            cardContainer.innerHTML += `       <div data-folder="${folder}" class="card">
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <div  class="play">
                            <i class="fa-solid fa-play"></i>
                        </div>
                        <h2>${response.title}</h2>
                        <p>${response.discription}</p>
                    </div>`

        }
    }

    //load the playlist when the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async (item) => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);

        })
    })

}

async function main() {

    await getsongs("songs/ncs");

    //display all the albums on the page
    await displayAlbums();


    //attach an event listener to the pause next and previous button
    pause.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            pause.classList.remove("fa-play");
            pause.classList.add("fa-pause");
        } else {
            currentSong.pause();
            pause.classList.remove("fa-pause");
            pause.classList.add("fa-play");
        }
    }
    );

    // attach an event listener to the audio element to update the song time
    currentSong.addEventListener("timeupdate", () => {
        let currentTime = currentSong.currentTime;
        let duration = currentSong.duration;
        let minutes = Math.floor(currentTime / 60);
        let seconds = Math.floor(currentTime % 60);
        let minutes2 = Math.floor(duration / 60);
        let seconds2 = Math.floor(duration % 60);
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        if (seconds2 < 10) {
            seconds2 = "0" + seconds2;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (minutes2 < 10) {
            minutes2 = "0" + minutes2;
        }

        if (isNaN(seconds) || seconds < 0) {
            seconds = "00";
        }
        if (isNaN(seconds2) || seconds2 < 0) {
            seconds2 = "00";
        }
        document.querySelector(".songtime").innerHTML = `${minutes}:${seconds} / ${minutes2}:${seconds2}`;

        // document.querySelector(".circle").style.width = `${(currentTime / duration) * 100}%`;
        document.querySelector(".circle").style.left = `${(currentTime / duration) * 100}%`;
    });


    //most important part of the code
    //add event listener to the seekbar slider
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let seekbar = document.querySelector(".seekbar");
        let seekbarWidth = seekbar.offsetWidth;
        let clickX = e.clientX - seekbar.getBoundingClientRect().left;//
        let duration = currentSong.duration;
        currentSong.currentTime = (clickX / seekbarWidth) * duration;
    });


    //add event listener for hamburger menu 
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0px";

    });


    //add event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-190%";
    });



    // attach an event listener to the previous button
    previous.addEventListener("click", () => {
        currentSong.pause();
        let currentSongIndex = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((currentSongIndex-1) >= 0) {
            playMusic(songs[currentSongIndex - 1]);
        }
        
    });


    // attach an event listener to the next button
    next.addEventListener("click", () => {
        currentSong.pause();
        let currentSongIndex = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((currentSongIndex+1) < songs.length) {
            playMusic(songs[currentSongIndex + 1]);
        }
    });


    //add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if(currentSong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg","volume.svg");
        }
    })


    document.querySelector(".volume > img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume")) {
            e.target.src = e.target.src.replace("volumehigh.svg", "mute.svg");
            currentSong.muted = true;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volumehigh.svg");
            currentSong.muted = false;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

}
main();