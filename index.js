class Country {
    constructor() {
        this.state = {
            alphabet: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
            url: `https://restcountries.eu/rest/v2`,
            countries: [],
            countriesOnPage: 15,
            paginationButtons: null,
        }

        this.letters = document.querySelector('#letters');
        this.hamburger = document.querySelector('#hamburger');
        this.navigation = document.querySelector('#navigation');
        this.showAllCountries = document.querySelector('#show-countries');
        this.container = document.querySelector('#container');

        this.init();
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

    toggleHamburgerAndNavigation = () => {
        this.hamburger.classList.toggle('hamburger--active');
        this.navigation.classList.toggle('navigation--active');
    }

    getAllCountries = async () => {
        let {url, countries} = this.state;
        const res = await fetch(`${url}/all`);
        const data = await res.json();
        this.state.countries = data;

        // console.log(this.state.countries);
    }

    loadCountries =  () => {
        const tempTab = this.state.countries;

        let temp = tempTab.splice(0, 10);

        // console.log(tempTab);
        // console.log(temp);

        temp.forEach( ({name, flag} = country) => this.showCountry(this.container, name, flag));
    }

    showCountry = (container, name, flag) => {
        const template = `
        <div class="country">
            <div class="country__image">
                <img src="${flag}" alt="${name}" class="country__flag">
            </div>
            <div class="country__details">
                <h2 class="country__name">${name}</h2>
                <button data-country="${name}" class="country__btn">Details</button>
            </div>
        </div>
        `;
    
        return container.innerHTML += template;
    }

    showDOMCountries = () => {
        console.log(this.state);
    }

    // getPagination() {
    //     let {paginationButtons, countriesOnPage, countries} = this.state;
    //     this.state.paginationButtons = Math.ceil(countries.length / countriesOnPage);
    // }



    init() {
        this.generateLetters();
        this.getAllCountries();
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const country = new Country();
    country.hamburger.addEventListener('click', country.toggleHamburgerAndNavigation);
    country.showAllCountries.addEventListener('click', country.loadCountries)
});