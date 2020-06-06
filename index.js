class Country {
    constructor() {
        this.state = {
            alphabet: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
            url: `https://restcountries.eu/rest/v2`,
            countries: [],
            countriesOnPage: 15,
            page: 1,
            displayedPages: 5,
            isPaginationLoaded: false
        }

        this.letters = document.querySelector('#letters');
        this.hamburger = document.querySelector('#hamburger');
        this.navigation = document.querySelector('#navigation');
        this.showAllCountries = document.querySelector('#show-countries');
        this.container = document.querySelector('#container');
        this.paginationContainer = document.querySelector('#pagination');
        this.searchCountry = document.querySelector('#search-country');
        this.showCountry = document.querySelector('#show-country');
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

    clearContainer = () => {
        this.container.innerHTML = '';
    }

    toggleHamburgerAndNavigation = () => {
        this.hamburger.classList.toggle('hamburger--active');
        this.navigation.classList.toggle('navigation--active');
    }

    getAllCountries = async () => {
        let {url} = this.state;
        const res = await fetch(`${url}/all`);
        const data = await res.json();
        this.state.countries = data;

    }

    getCountryTemplate(container, name, flag) {
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

    getPagination(data, page, countriesOnPage) {
        let start = (page - 1) * countriesOnPage;
        let end = start + countriesOnPage;
        let trimmedData = data.slice(start, end);
        let pages = Math.ceil(data.length / countriesOnPage);

        return {
            'data': trimmedData,
            'pages': pages
        }
    }

    loadCountries =  () => {
        const data = this.getPagination(this.state.countries, this.state.page, this.state.countriesOnPage);

        this.clearContainer();
        
        data.data.forEach( ({name, flag} = country) => {
            this.getCountryTemplate(this.container, name, flag);
        });

        this.getPageButtons(data.pages);
    }

    getPageButtons = pages => {
        this.paginationContainer.style.display = 'flex';
        this.paginationContainer.innerHTML = '';

        let maxLeft = (this.state.page - Math.floor(this.state.displayedPages / 2))
        let maxRight = (this.state.page + Math.floor(this.state.displayedPages / 2))

        if (maxLeft < 1) {
            maxLeft = 1
            maxRight = this.state.displayedPages
        }

        if (maxRight > pages) {
            maxLeft = pages - (this.state.displayedPages - 1)

            if (maxLeft < 1) {
                maxLeft = 1
            }
            maxRight = pages
        }

        for (let i = maxLeft; i <= maxRight; i++) {
            this.paginationContainer.innerHTML += `<button value=${i} class="btn btn--pagination">${i}</button>`
        }

        if (this.state.page != 1) {
            this.paginationContainer.innerHTML = `<button value=${1} class="btn btn--pagination">&#171; First</button>` + this.paginationContainer.innerHTML;
        }

        if (this.state.page != pages) {
            this.paginationContainer.innerHTML += `<button value=${pages} class="btn btn--pagination">Last &#187;</button>`
        }

        if(!this.state.isPaginationLoaded) {
            this.paginationContainer.addEventListener('click', (e) => {
                if(e.target.value) {
                    this.clearContainer();
                    this.state.page = +e.target.value;
                    this.loadCountries();
                }
            })
            this.state.isPaginationLoaded = true;
        }
    }

    selectCountryByFirstLetter = e => {
        const letter = e.target.dataset.letter;
        if(letter) {
            this.container.innerHTML = ''
            this.state.countries.forEach(({name, flag} = country) => {
                let lowerName = name.toLowerCase();

                if(lowerName.includes('å')) {
                    lowerName = lowerName.replace('å', 'a');
                }
                const firstLetter = lowerName[0];

                if(firstLetter === letter) {
                    this.getCountryTemplate(this.container, name, flag)
                }
                
            })
        }
    }

    getCountryByItsName = async () => {
        this.clearContainer();
        const {url} = this.state;
        const country = this.searchCountry.value;
    
        if(country) {
            const res = await fetch(`${url}/name/${country}`);
            const data = await res.json();

            data.forEach(({name, flag} = data) => this.getCountryTemplate(this.container, name, flag));
        }
        this.searchCountry.value = '';
    }

    getDatasetFromCountry(e) {
        const countryName = e.target.dataset.country;
        if(countryName) return countryName;
    }

    showDetailedInfoAboutCountry = e => {
        const countryDataset = this.getDatasetFromCountry(e);
        
        if(countryDataset) {
            this.state.countries.forEach(country => {
                if(country.name === countryDataset) {
                    console.log(country);
                    this.detailInfoTemplate(this.container, country);
                }
            })
        };
    }

    detailInfoTemplate(container, country) {
        const template = document.createElement('div');
        template.className = 'details';
        template.innerHTML = `
            <div class="details__container">
                <button class="details__btn-close" data-close="close">X</button>
                <span>${country.name}</span>
            </div>
        `;

        container.appendChild(template);
    }


    init() {
        this.generateLetters();
        this.getAllCountries();
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const country = new Country();
    country.init();
    country.hamburger.addEventListener('click', country.toggleHamburgerAndNavigation);
    country.showAllCountries.addEventListener('click', country.loadCountries);
    country.letters.addEventListener('click', country.selectCountryByFirstLetter);
    country.showCountry.addEventListener('click', country.getCountryByItsName);
    country.searchCountry.addEventListener('keypress', (e) => {
        if(e.keyCode === 13) {
            country.getCountryByItsName();
        }
    })
    country.container.addEventListener('click', (e) => country.showDetailedInfoAboutCountry(e))
});