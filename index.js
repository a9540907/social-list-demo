(function () {
  const Base_URL = "https://lighthouse-user-api.herokuapp.com"
  const Index_URL = Base_URL + "/api/v1/users/"
  const data = []
  const allCard = document.getElementById("card-list")
  const serchInput = document.getElementById("search-input")
  const searchSelect = document.getElementById("search-select")
  const pagination = document.getElementById("pagination")
  const icon = document.getElementById("icon")
  const serch = document.getElementById("search")
  const navbar = document.querySelector(".navbar-collapse")
  const genderBtn = document.querySelector(".gender-btn")
  const favoriteList = JSON.parse(localStorage.getItem('favoritePeople')) || []
  const ITEM_PER_PAGE = 12
  let paginationData = []
  let PresetMode = 'showCard'
  let pageNumber = 1


  axios.get(Index_URL)
    .then((response) => {
      data.push(...response.data.results)
      // showCard(data)    
      getTotalPages(data)
      getPageData(1, data)
    }).catch((err) => console.log(err))

  function showCard(data) {
    let content = " "
    data.forEach(item => {
      content += `
        <div class="card" style="width: 13rem;">
          <img src="${item.avatar}" class="card-img-top user-img" data-id="${item.id}" alt="..." data-toggle="modal" data-target="#exampleModal">
          <div class="card-body">
            <p class="card-text">${item.name}
            <i class="far fa-heart text-danger dislike" style="cursor:pointer;" data-id="${item.id}"></i>
          </span></p>
          </div>
        </div>
      `
    })
    allCard.innerHTML = content
  }

  function showList(data) {
    let htmlContent = `
      <table class="table table-hover" >
        <tbody> 
      `
    data.forEach(item => {
      htmlContent += `
      <tr>
        <td><img src="${item.avatar}" width = "90" class=" user-img" data-id="${item.id}" alt="..." data-toggle="modal" data-target="#exampleModal"></td>
        <td><h5>${item.name} ${item.surname}</h5></td>
        <td>${item.age} years old</td>
        <td><i class="far fa-heart fa-2x text-danger dislike" style="cursor:pointer;" data-id="${item.id}"></i></td>
      </tr>
      `
    })
    htmlContent += `
        </tbody>
      </table>
    `
    allCard.innerHTML = htmlContent
  }

  //檢查頁面愛心狀態
  function checkHeart() {
    const heartIcon = document.querySelectorAll(".fa-heart")
    heartIcon.forEach((heart) => {
      let heartTack = favoriteList.some(item => item.id === Number(heart.dataset.id))
      if (heartTack) {
        heart.classList.remove("far", "dislike")
        heart.classList.add("like", "fas")
      } else {
        heart.classList.add("far", "dislike")
        heart.classList.remove("fas", "like")
      }
    })
  }

  //改變愛心的狀態
  function changeHeart(event) {
    if (event.target.matches(".dislike")) {
      event.target.classList.remove("far", "dislike")
      event.target.classList.add("like", "fas")
    } else if (event.target.matches(".like")) {
      event.target.classList.add("far", "dislike")
      event.target.classList.remove("fas", "like")
    }
  }

  function showPersonalInfo(id) {
    const title = document.getElementById("title")
    const personal = document.querySelector(".modal-body")
    const footer = document.querySelector(".modal-footer")
    const personal_URL = Index_URL + id

    title.innerText = " "
    personal.innerHTML = " "

    axios.get(personal_URL)
      .then((response) => {
        const info = response.data

        title.innerText = info.name + "  " + info.surname
        personal.innerHTML =
          `<div class="md-center infoImg" align="center">
           <img src=${info.avatar} class="info-img">
         </div>
         <div class="user-info">
           <ul>
             <li class="list-unstyled"><i class="fas fa-user-alt"></i> Gender: ${info.gender}</li>
             <li class="list-unstyled"><i class="fas fa-child"></i> Age: ${info.age} </li>
             <li class="list-unstyled"><i class="fas fa-envelope-square"></i> Emali: ${info.email} </li>
             <li class="list-unstyled"><i class="fas fa-birthday-cake"></i> Birthday: ${info.birthday} </li>
             <li class="list-unstyled"><i class="fas fa-map-marker-alt"></i> Region: ${info.region} </li>
           </ul>
         </div>
        `
      })
      .catch((err) => console.log(err))
  }

  function handleUserDataClick(event) {
    if (event.target.matches(".user-img")) {
      showPersonalInfo(event.target.dataset.id)
    } else if (event.target.matches(".dislike")) {
      changeHeart(event)
      addFavoriteItem(event.target.dataset.id)
    } else if (event.target.matches(".like")) {
      changeHeart(event)
      removeFavoriteItem(event.target.dataset.id)
    }
  }

  function renderNavbarPage(event) {
    if (event.target.matches(".favorite-page")) {
      if (favoriteList.length === 0) {
        allCard.innerHTML = `<div class="my-5 mx-auto noFavorite"><h2>Your favorite list is empty.</h2></div>`
        getTotalPages(favoriteList)
      } else {
        getTotalPages(favoriteList)
        getPageData(1, favoriteList)
      }//else       
    } else if (event.target.matches(".home-page")) {
      getTotalPages(data)
      getPageData(1, data)
      serchInput.value = ""
    }
  }

  //加入我的最愛
  function addFavoriteItem(id) {
    const userLike = data.find(item => item.id === Number(id))
    if (favoriteList.some(item => item.id === Number(id))) {
      return
    } else {
      favoriteList.push(userLike)
    }
    localStorage.setItem('favoritePeople', JSON.stringify(favoriteList))
  }

  //移除我的最愛
  function removeFavoriteItem(id) {
    const index = favoriteList.findIndex(item => item.id === Number(id))
    if (index === -1) return

    favoriteList.splice(index, 1)
    localStorage.setItem('favoritePeople', JSON.stringify(favoriteList))
    if (navbar.querySelector('.active').textContent === 'Favorite') {
      getTotalPages(favoriteList)
      getPageData(1, favoriteList)

      if (favoriteList.length === 0) {
        allCard.innerHTML = `<div class="my-5 mx-auto noFavorite"><h2>Your favorite list is empty.</h2></div>`
        getTotalPages(favoriteList)
      }
    }
  }

  //性別篩選按鈕
  function genderFilter() {
    let result = []
    let input = serchInput.value.toLowerCase()
    let searchResult = []

    if (input === "") {
      searchResult = data
    } else if (input !== "") {
      if (searchSelect.value === "name") {
        searchResult = data.filter(user => (user.name.toLowerCase().includes(input) || user.surname.toLowerCase().includes(input)))
      } else if (searchSelect.value === "region") {
        searchResult = data.filter(user => (user.region.toLowerCase().includes(input)))
      }
    }
    if (event.target.matches(".male")) {
      result = searchResult.filter((item) => item.gender === "male")
    } else if (event.target.matches(".female")) {
      result = searchResult.filter((item) => item.gender === "female")
    } else {
      result = searchResult
    }
    getTotalPages(result)
    getPageData(pageNumber, result)
  }

  //切換模式
  function switchMode(event) {
    if (event.target.matches(".fa-th")) {
      PresetMode = 'showCard'
    } else if (event.target.matches('.fa-bars')) {
      PresetMode = 'showList'
    }
    getPageData(pageNumber)
  }

  //搜尋
  function searchSelectCondition(event) {
    event.preventDefault()
    let input = serchInput.value.toLowerCase()
    let searchResults = []

    if (searchSelect.value === "name") {
      searchResults = data.filter(
        user => (user.name.toLowerCase().includes(input) || user.surname.toLowerCase().includes(input)))
    } else if (searchSelect.value === "region") {
      searchResults = data.filter(
        user => (user.region.toLowerCase().includes(input)))
    }
    getTotalPages(searchResults)
    pageNumber = 1
    getPageData(pageNumber, searchResults)
  }

  //計算所有分頁
  function getTotalPages(data) {
    let totalPagws = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = " "
    for (let i = 0; i < totalPagws; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>                      
      `
    }
    pagination.innerHTML = pageItemContent
  }

  //選擇當前分頁
  function currentPage(event) {
    // console.log(event.target.dataset.page)
    if (event.target.tagName === 'A') {
      pageNumber = event.target.dataset.page
      getPageData(pageNumber)
    }
  }

  //顯示當前分頁資料
  function getPageData(pageNum, data) {
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    if (PresetMode === 'showCard') showCard(pageData)
    else showList(pageData)
    checkHeart()
  }

  function changeNabarPageActive(event) {
    if (!event.target.matches(".active")) {
      if (event.target.matches(".favorite-page")) {
        event.target.classList.add("active")
        document.querySelector(".home-page").classList.remove("active")
      } else if (event.target.matches(".home-page")) {
        event.target.classList.add("active")
        document.querySelector(".favorite-page").classList.remove("active")
      }
    }
  }

  allCard.addEventListener('click', handleUserDataClick)
  icon.addEventListener('click', switchMode)
  serch.addEventListener('submit', searchSelectCondition)
  pagination.addEventListener('click', currentPage)
  navbar.addEventListener('click', renderNavbarPage)
  navbar.addEventListener('click', changeNabarPageActive)
  genderBtn.addEventListener('click', genderFilter)
})()

