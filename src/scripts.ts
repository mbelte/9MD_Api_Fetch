import {
    CharacterRequestInfo,
    CharacterToDisplay,
    CharacterRequestResults,
    CharacterRequest,
    EpisodeRequest
} from "./types"


let currentPage = 1,
    nextPage: string | null

const drawCardSectionHtml = (title: string, val: string, val2: string = '') => {
    return `
        <div class="character-card__section">
            <span class="character-card__title">
                ${title}:
            </span>
            <span class="character-card__value">
                ${val2 && `(${val2} )`}
                ${val}
            </span>
        </div>
    `
}

const drawCardHtml = (character: CharacterToDisplay) => {

    const   c = character,

            statusClass = (['Dead', 'unknown'].includes(c.status)) ? 
                `character-card__desc--${c.status.toLowerCase()}` : ''


    return `
        <div class="character-card">
            <div class="character-card__img-holder">
                <img src="${c.image}" alt="${c.name}" class="character-card__img">
            </div>

            <div class="character-card__info">
                <div class="character-card__header">
                    <h3 class="character-card__heading">
                        ${c.name}
                    </h3>
                    <div class="character-card__desc ${statusClass}">
                        <span class="character-card__status">
                            ${c.status} - ${c.species}
                        </span>
                    </div>
                </div>

                ${drawCardSectionHtml('Origin', c.origin)}                
                ${drawCardSectionHtml('Last known location', c.lastLocation)}
                ${drawCardSectionHtml('First seen in', c.firstEpName, c.firstEpNum)}
                
            </div>
        </div>
    `
}

const fetchCharacters = (page: number) => {

    const charactersContainer = document.querySelector<HTMLDivElement | null>('.characters-list')

    fetch('https://rickandmortyapi.com/api/character/?page=' + page)
        .then((response) => response.json())
        .then((charData: CharacterRequest) => {
            
            nextPage = charData.info.next

            charData.results.forEach((char: CharacterRequestResults) => {

            fetch(char.episode[0])
                .then((response) => response.json())
                .then((epData: EpisodeRequest) => {

                    charactersContainer.innerHTML += drawCardHtml({
                        image: char.image,
                        name: char.name,
                        status: char.status,
                        species: char.species,
                        origin: char.origin.name,
                        lastLocation: char.location.name,
                        firstEpName: epData.name,
                        firstEpNum: epData.episode
                    })
                })
            })
        })
}

const triggerToast = () => {
    const toast = document.querySelector<HTMLDivElement | null>('.toast')

    toast.classList.add('toast--visible')
}

const removeInfiniteScroll = () => {
    window.removeEventListener("scroll", handleInfiniteScroll)
}

const handleInfiniteScroll = () => {
    const endOfPage = window.innerHeight + window.pageYOffset >= document.body.offsetHeight

    if (endOfPage) {

        if(nextPage !== null) {
            currentPage++
            fetchCharacters(currentPage)
        } else {
            triggerToast()
            removeInfiniteScroll()
        }
    }
}

window.addEventListener("scroll", handleInfiniteScroll)

fetchCharacters(currentPage)