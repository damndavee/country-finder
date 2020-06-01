class Country {
    constructor() {
        this.state = {
            alphabet: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
            url: `https://restcountries.eu/rest/v2`,
            countries: []
        }

        this.letters = document.querySelector('#letters');
        this.hamburger = document.querySelector('#hamburger');
        this.navigation = document.querySelector('#navigation');

        this.init();
    }

    getAllCountries = async () => {
        const {url} = this.state;

        const res = await fetch(`${url}/all`);
        const data = await res.json();

        this.state.countries = data;
        console.log(this.state);
    }

    toggleHamburgerAndNavigation = () => {
        this.hamburger.classList.toggle('hamburger--active');
        this.navigation.classList.toggle('navigation--active');
    }

    generateLetters = () => {
        this.state.alphabet.forEach(letter => {
            const newLetter = document.createElement('div');
            newLetter.classList = 'letter';
            newLetter.innerText = letter;
            newLetter.dataset.letter = letter;
            this.letters.appendChild(newLetter);
        })

        
    }

    init() {
        this.generateLetters();
        this.getAllCountries();
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const country = new Country();
    country.hamburger.addEventListener('click', country.toggleHamburgerAndNavigation);
});