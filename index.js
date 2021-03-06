class Country {
    constructor() {
        this.state = {
            alphabet: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
            url: `https://restcountries.eu/rest/v2`,
            countries: [],
            pages: null,
            countriesOnPage: 15,
            page: 1,
            displayedPages: 5,
            areCountriesLoaded: false,
        }
        
        this.desktopViewport = window.matchMedia("screen and (min-width: 540px)");
        this.smallViewport = window.matchMedia("screen and (max-width: 640px)");
        this.smallDesktopViewport = window.matchMedia("screen and (max-width: 960px)");
        this.normalDesktop = window.matchMedia("screen and (min-width: 961px)");

        this.letters = document.querySelector('#letters');
        this.hamburger = document.querySelector('#hamburger');
        this.navigation = document.querySelector('#navigation');
        this.container = document.querySelector('#container');
        this.searchCountry = document.querySelector('#search-country');
        this.showAllCountries = document.querySelector('#show-countries');
        this.showCountry = document.querySelector('#show-country');
        
        this.paginationContainer = document.querySelector('#pagination');
        this.nextBtn = document.querySelector("#nextBtn");
        this.prevBtn = document.querySelector("#prevBtn");
        this.currentPage = document.querySelector('#currentPage');
    }

    generateLetters = () => {
        this.letters.innerHTML = '';
        
        this.state.alphabet.forEach(letter => {
            const newLetter = document.createElement('div');
            newLetter.classList = 'letter';
            newLetter.innerText = letter;
            newLetter.dataset.letter = letter;
            this.letters.appendChild(newLetter);
        })
    }

    generateSelectAlphabet = () => {
        this.letters.innerHTML = '';
        const select = document.createElement('select');
    
        select.classList.add('select');

        this.state.alphabet.forEach(letter => {
            const option = document.createElement('option');
            option.value = letter;
            option.innerHTML = letter;
            select.appendChild(option);
        })

        this.letters.appendChild(select);
    }

    generateAlphabetDependedOnResolution = isDesktop => {
        isDesktop ? this.generateLetters() : this.generateSelectAlphabet();
    }

    toggleCountriesPerPage() {
        if(this.smallViewport.matches) {
            this.state.countriesOnPage = 10;
        } else if(this.smallDesktopViewport.matches) {
            this.state.countriesOnPage = 12;
        } else if(this.normalDesktop.matches) {
            this.state.countriesOnPage = 15;
        }

        if(this.state.areCountriesLoaded) {
            this.loadCountries();
            this.checkPagination();
        }

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

        this.state.pages = pages;

        return {
            'data': trimmedData,
            'pages': pages
        }
    }

    loadCountries =  () => {
        this.paginationContainer.style.display = 'flex';
        const data = this.getPagination(this.state.countries, this.state.page, this.state.countriesOnPage);

        this.clearContainer();
        
        data.data.forEach( ({name, flag} = country) => {
            this.getCountryTemplate(this.container, name, flag);
        });

        this.updateCurrentPage();

        this.state.areCountriesLoaded = true;
        
    }

    checkPagination() {
        this.state.page === 1 ? this.prevBtn.disabled = true : this.prevBtn.disabled = false;
        this.state.page === this.state.pages ? this.nextBtn.disabled = true :this.nextBtn.disabled = false;

        if(this.state.page > this.state.pages) {
            this.state.page = this.state.pages;
            this.loadCountries();
        }
    }

    updatePagination(value) {
        this.clearContainer();
        this.state.page += (+value);
        this.loadCountries();
        this.currentPage.innerHTML = `${this.state.page} / ${this.state.pages}`;
        this.checkPagination();
    }

    updateCurrentPage() {
        this.currentPage.innerHTML = `${this.state.page} / ${this.state.pages}`;
    }

    selectCountryByFirstLetter = (e, selectOrAlphabet) => {
        this.paginationContainer.style.display = 'none';
        const letter = selectOrAlphabet === 'alphabet' ? e.target.dataset.letter : e.target.value;
        
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

    closeDetailedInfoAboutCountry = e => {
        const target = e.target.dataset.close;

        if(target) {
            const details = e.target.parentNode.parentNode;
            e.target.parentNode.parentNode.parentNode.removeChild(details);
        } 
    }

    detailInfoTemplate(container, country) {
        const template = document.createElement('div');
        template.className = 'details';
        template.innerHTML = `
            <div class="details__container">
                <button class="details__btn-close" data-close="close">X</button>
                <h2 class="details__heading">${country.name}</h2>
                <div class="details__img-container">
                    <img class="details__img" src="${country.flag}"></img>
                </div>

                <div class="details__country-details">
                    <span>${country.alpha3Code}</span></br>
                    <span>${country.alpha2Code}</span></br>
                    <span>${country.altSpellings.map(el => `<span>${el}</span>`)}</span></br>
                    <span>${country.area}xd</span></br>
                    <span>${country.borders.map(border => `<span>${border}</span>`)}</span></br>
                    <span>${country.capital}</span></br>
                    <span>${country.cioc}</span></br>
                    <span>${country.currencies.map(cur => `<span>${cur.code} ${cur.name} ${cur.symbol}</span>`)}</span></br>
                    <span>${country.demonym}</span></br>
                    <span>${country.gini}</span></br>
                    <span>${country.languages.map(lang => `<span>${lang.name} ${lang.nativeName}</span>`)}</span></br>
                    
                    <span>${country.nativName}</span>
                    <span>${country.numericCode}</span>
                    <span>${country.population}</span>
                    <span>${country.region}</span>
                    <span>${country.regionalBlocks}</span>
                    <span>${country.subregion}</span>
                    <span>${country.timezones}</span>
                    <span>${country.topLevelDomain}</span>
                    <span>${country.translations}</span>
                </div>
            </div>
        `;

        container.appendChild(template);
    }


    init() {
        this.generateAlphabetDependedOnResolution(this.desktopViewport.matches);
        this.getAllCountries();
        this.toggleCountriesPerPage(this.smallViewport);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const country = new Country();

    country.init();
    
    country.hamburger.addEventListener('click', country.toggleHamburgerAndNavigation);
    country.showAllCountries.addEventListener('click', country.loadCountries);
    country.letters.addEventListener('click', (e) => country.selectCountryByFirstLetter(e, 'alphabet'));
    country.letters.addEventListener('change', (e) => country.selectCountryByFirstLetter(e, 'select'))
    country.showCountry.addEventListener('click', country.getCountryByItsName);
    country.searchCountry.addEventListener('keypress', (e) => {
        if(e.keyCode === 13) {
            country.getCountryByItsName();
        }
    })

    country.container.addEventListener('click', (e) => country.showDetailedInfoAboutCountry(e));
    country.container.addEventListener('click', (e) => country.closeDetailedInfoAboutCountry(e));

    country.nextBtn.addEventListener('click', () => country.updatePagination(country.nextBtn.value))
    country.prevBtn.addEventListener('click', () => country.updatePagination(country.prevBtn.value))

    country.desktopViewport.addListener(isDesktop => {
        country.generateAlphabetDependedOnResolution(isDesktop.matches)
    })

    country.smallViewport.addListener(() => {
        country.toggleCountriesPerPage();
    }) 

    country.normalDesktop.addListener(() => {
        country.toggleCountriesPerPage();
    })

});