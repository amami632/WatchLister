window.onload = init;

let mm; // global MovieManager variable

function init() { 
    mm = new MovieManager();
    mm.addTestData();
    mm.updateStats();
    setView('posters'); // Set posters view to be default

    startCanvasAnimation();
  }

const DEFAULT_POSTER =
  "images/default.jpg";

 function setView(view) {
  const tableCard = document.querySelector(".card-table");
  const postersCard = document.querySelector("#postersCard");

  document.querySelector("#viewTableBtn").classList.toggle("chip-active", view === "table");
  document.querySelector("#viewPostersBtn").classList.toggle("chip-active", view === "posters");

  if (view === "posters") {
    tableCard.classList.add("hidden");
    postersCard.classList.remove("hidden");
    mm.displayMoviesAsPosters("postersGrid");
  } else {
    postersCard.classList.add("hidden");
    tableCard.classList.remove("hidden");
    mm.displayMoviesAsATable("movies");
  }
} 


function openMovieModal(movie) {
    const modal = document.querySelector("#movieModal");
    const poster = document.querySelector("#modalPoster");
  
    document.querySelector("#modalTitle").textContent = movie.title || "(No title)";
  
    const metaParts = [];
    if (movie.mainCategory) metaParts.push(movie.mainCategory);
    if (movie.releaseYear) metaParts.push(movie.releaseYear);
    if (movie.platform) metaParts.push(movie.platform);
    document.querySelector("#modalMeta").textContent = metaParts.join(" · ") || "—";
  
    document.querySelector("#modalActors").textContent = movie.actors || "—";
    document.querySelector("#modalGenre").textContent  = movie.subCategory || "—";
    document.querySelector("#modalDescription").textContent = movie.description || "No description available.";
  
    poster.src = movie.posterUrl ? movie.posterUrl : DEFAULT_POSTER;
    poster.onerror = function () {
      this.onerror = null;
      this.src = DEFAULT_POSTER;
    };
  
    const trailerBtn = document.querySelector("#modalTrailerBtn");
    if (movie.trailerUrl) {
      trailerBtn.classList.remove("hidden");
      trailerBtn.onclick = () => window.open(movie.trailerUrl, "_blank");
    } else {
      trailerBtn.classList.add("hidden");
      trailerBtn.onclick = null;
    }
  
    // // Extra images
    // const extras = document.querySelector("#modalExtraImages");
    // extras.innerHTML = "";
    // if (movie.extraImages) {
    //   movie.extraImages.split(",").forEach(raw => {
    //     const url = raw.trim();
    //     if (!url) return;
    //     const img = document.createElement("img");
    //     img.src = url;
    //     img.alt = "Extra image";
    //     extras.appendChild(img);
    //   });
    // }
  
    modal.classList.remove("hidden");
  }
  
  function closeMovieModal() {
    document.querySelector("#movieModal").classList.add("hidden");
  }
  
  // added this to close modal on ESC key press following keyboard tutorial
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMovieModal();
  });
  
function formSubmitted() {
  let title       = document.querySelector("#title");
  let platform    = document.querySelector("#platform");
  let actors      = document.querySelector("#actors");
  let mainCat     = document.querySelector("#mainCategory");
  let subCat      = document.querySelector("#subCategory");
  let releaseYear = document.querySelector("#releaseYear");
  let posterUrl   = document.querySelector("#posterUrl");
//   let extraImages = document.querySelector("#extraImages");
  let trailerUrl  = document.querySelector("#trailerUrl");

  let movie = new Movie(
    title.value,
    platform.value,
    actors.value,
    mainCat.value,
    subCat.value,
    releaseYear.value,
    posterUrl.value,
    // extraImages.value,
    trailerUrl.value
  );

  mm.add(movie);
  mm.save();   // modifying the localStorage 

mm.updateStats();

// console.log("SUBMIT FIRED");
// alert("SUBMIT FIRED");


  // reset fields on same live page
  title.value       = "";
  platform.value    = "";
  actors.value      = "";
  mainCat.value     = "";
  subCat.value      = "";
  releaseYear.value = "";
  posterUrl.value   = "";
//   extraImages.value = "";
  trailerUrl.value  = "";

  // go to last page to see new row
  mm.currentPage = mm.getTotalPages();
  mm.updateStats();
  const postersVisible = !document.querySelector("#postersCard").classList.contains("hidden");
  if (postersVisible) mm.displayMoviesAsPosters("postersGrid");
  else mm.displayMoviesAsATable("movies", { highlightLast: true });

  return false;
}

function toggleForm() {
  let formCard = document.querySelector("#formCard");
  let btn = document.querySelector("#toggleFormBtn");

  formCard.classList.toggle("collapsed");

  if (formCard.classList.contains("collapsed")) {
    btn.textContent = "+ Add a new title";
  } else {
    btn.textContent = "− Hide form";
  }
}

/* ===== Toolbar: filter + search ===== */

function setFilter(type) {
  mm.filterType = type; // 'all' | 'movie' | 'series'
  mm.currentPage = 1;


  // Toggle chip classes
  document.querySelector("#filterAll").classList.toggle("chip-active", type === "all");
  document.querySelector("#filterMovies").classList.toggle("chip-active", type === "movie");
  document.querySelector("#filterSeries").classList.toggle("chip-active", type === "series");

  const postersVisible = !document.querySelector("#postersCard").classList.contains("hidden");
  if (postersVisible) mm.displayMoviesAsPosters("postersGrid");
  else mm.displayMoviesAsATable("movies");

}

function onSearchChange() {
    const input = document.querySelector("#searchQuery");
    const select = document.querySelector("#searchMode");
  
    mm.searchText = input.value.toLowerCase();
    mm.searchMode = select ? select.value : "title";
    mm.currentPage = 1;
  
    const postersVisible = !document.querySelector("#postersCard").classList.contains("hidden");
    if (postersVisible) mm.displayMoviesAsPosters("postersGrid");
    else mm.displayMoviesAsATable("movies");
  }

// pagination
function nextPage() {
  mm.nextPage();
  mm.displayMoviesAsATable("movies");
}

function prevPage() {
  mm.prevPage();
  mm.displayMoviesAsATable("movies");
}

/* ===== Editable cells helper ===== */

function createEditableCell(row, movie, propertyName) {
  let cell = row.insertCell();
  cell.classList.add("editable-cell");

  let label = document.createElement("span");
  label.classList.add("cell-label");
  label.textContent = movie[propertyName] || "";

  let input = document.createElement("input");
  input.classList.add("cell-input", "hidden");
  input.value = movie[propertyName] || "";
  input.type = (propertyName === "releaseYear") ? "number" : "text";

  cell.appendChild(label);
  cell.appendChild(input);

  label.addEventListener("click", function () {
    label.classList.add("hidden");
    input.classList.remove("hidden");
    cell.classList.add("editing");
    input.focus();
  });

  input.addEventListener("blur", function () {
    movie[propertyName] = input.value;
    label.textContent = input.value;
    input.classList.add("hidden");
    label.classList.remove("hidden");
    cell.classList.remove("editing");
    mm.updateStats(); // stats up top !
  });
}

/* ===== Classes ===== */

class Movie {
  constructor(title, platform, actors, mainCategory, subCategory,
              releaseYear, posterUrl, trailerUrl, description) {
    this.title        = title;
    this.platform     = platform;
    this.actors       = actors;
    this.mainCategory = mainCategory;
    this.subCategory  = subCategory;
    this.releaseYear  = releaseYear;
    this.posterUrl    = posterUrl;
    // this.extraImages  = extraImages;
    this.trailerUrl   = trailerUrl;
    this.description  = description;
  }
}

class MovieManager {
  constructor() {
    this.listOfMovies = [];
    this.currentPage  = 1;
    this.pageSize     = 8;
    this.filterType   = "all"; // default is all
    this.searchText   = "";
    this.searchMode   = "title";
  }

  displayMoviesAsPosters(idOfContainer) {
    let container = document.querySelector("#" + idOfContainer);
    container.innerHTML = "";
    let data = this.getFilteredList();


    if (data.length === 0) {
      container.innerHTML = "<p style='padding:10px;color:#9ca3af;'>No movies / series to display.</p>";
      return;
    }
  
    data.forEach((movie) => {
      const card = document.createElement("div");
      card.className = "poster-card";
  
      card.addEventListener("click", () => openMovieModal(movie));
  
      const img = document.createElement("img");
      img.src = movie.posterUrl ? movie.posterUrl : DEFAULT_POSTER;
  
      img.onerror = function () {
        this.onerror = null;
        this.src = DEFAULT_POSTER; // on error for images or when for example user enters an online pic that does not load for some reason
      };
  
      const meta = document.createElement("div");
      meta.className = "poster-meta";
  
      const title = document.createElement("p");
      title.className = "poster-title";
      title.textContent = movie.title || "(No title)";
  
      const sub = document.createElement("p");
      sub.className = "poster-sub";
      sub.textContent =
        (movie.mainCategory ? movie.mainCategory : "") +
        (movie.releaseYear ? " · " + movie.releaseYear : "") +
        (movie.platform ? " · " + movie.platform : "");
  
      meta.appendChild(title);
      meta.appendChild(sub);
  
      card.appendChild(img);
      card.appendChild(meta);
  
      container.appendChild(card);
    });
  }

  // hardcoded test data

  addTestData() {
    const autoMovies = [
        {
          title: "Inception",
          platform: "Netflix",
          actors: "Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page",
          mainCategory: "Movie",
          subCategory: "Science fiction, Thriller",
          releaseYear: "2010",
          posterUrl: "images/inception.jpg",
          trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
          description: "A skilled thief enters people's dreams to steal secrets, but this time he must plant an idea instead."
        },
        {
          title: "Interstellar",
          platform: "Amazon Prime Video",
          actors: "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
          mainCategory: "Movie",
          subCategory: "Science fiction, Drama",
          releaseYear: "2014",
          posterUrl: "images/interstellar.jpg",
          trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
          description: "A group of astronauts travel through space to find a new home for humanity."
        },
        {
          title: "Stranger Things",
          platform: "Netflix",
          actors: "Millie Bobby Brown, Finn Wolfhard, David Harbour",
          mainCategory: "Series",
          subCategory: "Science fiction, Horror",
          releaseYear: "2016",
          posterUrl: DEFAULT_POSTER,
          trailerUrl: "https://www.youtube.com/watch?v=e0Eo0D038rQ",
          description: "A group of kids face supernatural events after a boy mysteriously disappears."
        },
        {
          title: "Me Before You",
          platform: "Netflix",
          actors: "Emilia Clarke, Sam Claflin, Janet McTeer",
          mainCategory: "Movie",
          subCategory: "Romance, Drama",
          releaseYear: "2016",
          posterUrl: "images/mebeforeyou.jpg",
          trailerUrl: "https://www.youtube.com/embed/T0MmkG_nG1U",
          description: "A young woman forms a deep bond with a man who has lost his will to live."
        },
        {
          title: "Everything, Everything",
          platform: "Netflix",
          actors: "Amandla Stenberg, Nick Robinson, Anika Noni Rose",
          mainCategory: "Movie",
          subCategory: "Romance, Drama",
          releaseYear: "2017",
          posterUrl: "images/everything.jpg",
          trailerUrl: "https://www.youtube.com/watch?v=42KNwQ6u42U",
          description: "A teenage girl with a rare illness discovers love and risks everything to experience life."
        },
        {
          title: "LOL",
          platform: "Amazon",
          actors: "Miley Cyrus, Demi Moore, Douglas Booth",
          mainCategory: "Movie",
          subCategory: "Romantic comedy",
          releaseYear: "2012",
          posterUrl: "images/lol.jpg",
          trailerUrl: "https://www.youtube.com/watch?v=fEzWvEoD9ew",
          description: "A teenager navigates love, friendships, and conflicts with her mother."
        },
        {
          title: "One Day",
          platform: "Amazon",
          actors: "Anne Hathaway, Jim Sturgess",
          mainCategory: "Movie",
          subCategory: "Romance, Drama",
          releaseYear: "2011",
          posterUrl: DEFAULT_POSTER,
          trailerUrl: "https://www.youtube.com/watch?v=X8vGnkXd9rA",
          description: "Two people meet on the same day every year and see how their lives change over time."
        },
        {
          title: "Love, Rosie",
          platform: "Amazon",
          actors: "Lily Collins, Sam Claflin",
          mainCategory: "Movie",
          subCategory: "Romantic comedy, Drama",
          releaseYear: "2014",
          posterUrl: "images/loverosie.jpg",
          trailerUrl: "https://www.youtube.com/watch?v=5zL3YJKygd4",
          description: "Two best friends struggle with timing and misunderstandings in their love story."
        },
        {
          title: "Warm Bodies",
          platform: "Amazon",
          actors: "Nicholas Hoult, Teresa Palmer",
          mainCategory: "Movie",
          subCategory: "Romantic comedy, Horror",
          releaseYear: "2013",
          posterUrl: DEFAULT_POSTER,
          trailerUrl: "",
          description: "A zombie falls in love with a human girl, changing both their worlds."
        },
        {
          title: "Monte Carlo",
          platform: "Amazon",
          actors: "Selena Gomez, Leighton Meester, Katie Cassidy",
          mainCategory: "Movie",
          subCategory: "Romantic comedy",
          releaseYear: "2011",
          posterUrl: "images/montecarl.jpg",
          trailerUrl: "https://www.youtube.com/watch?v=X0n3Q_VDQk8",
          description: "Three friends travel to Paris and are mistaken for wealthy socialites."
        },
        {
          title: "If I Stay",
          platform: "Amazon",
          actors: "Chloë Grace Moretz, Jamie Blackley",
          mainCategory: "Movie",
          subCategory: "Romance, Drama",
          releaseYear: "2014",
          posterUrl: "images/ifIstay.jpg",
          trailerUrl: "https://www.youtube.com/watch?v=rMp896hfp74",
          description: "After a tragic accident, a young musician must decide whether to live or let go."
        },
        {
          title: "Safe Haven",
          platform: "Amazon",
          actors: "Julianne Hough, Josh Duhamel",
          mainCategory: "Movie",
          subCategory: "Romance, Thriller",
          releaseYear: "2013",
          posterUrl: DEFAULT_POSTER,
          trailerUrl: "https://www.youtube.com/watch?v=q3y8fFPPgdA",
          description: "A woman with a dark past finds love in a quiet coastal town."
        },
        {
          title: "50 First Dates",
          platform: "Amazon",
          actors: "Adam Sandler, Drew Barrymore",
          mainCategory: "Movie",
          subCategory: "Romantic comedy",
          releaseYear: "2004",
          posterUrl: "images/50firstDates.jpg",
          trailerUrl: "https://www.youtube.com/watch?v=17KJk3ErIx0",
          description: "A man tries to make a woman with memory loss fall in love with him every day."
        },
        {
          title: "The First Time",
          platform: "Amazon",
          actors: "Dylan O'Brien, Britt Robertson",
          mainCategory: "Movie",
          subCategory: "Romantic comedy",
          releaseYear: "2012",
          posterUrl: DEFAULT_POSTER,
          trailerUrl: "",
          description: "Two teenagers experience an unexpected and meaningful first love."
        },
        {
          title: "The Vow",
          platform: "Amazon",
          actors: "Rachel McAdams, Channing Tatum",
          mainCategory: "Movie",
          subCategory: "Romance, Drama",
          releaseYear: "2012",
          posterUrl: DEFAULT_POSTER,
          trailerUrl: "https://www.youtube.com/watch?v=PcL24s-S6ns",
          description: "A husband tries to make his wife fall in love with him again after she loses her memory."
        },
        {
          title: "Beastly",
          platform: "Amazon",
          actors: "Alex Pettyfer, Vanessa Hudgens",
          mainCategory: "Movie",
          subCategory: "Fantasy, Romance",
          releaseYear: "2011",
          posterUrl: "images/beastly.jpg",
          trailerUrl: "https://www.youtube.com/watch?v=vum62JOVuwY",
          description: "A modern version of Beauty and the Beast set in a high school environment."
        },
        {
          title: "Why Him",
          platform: "Amazon",
          actors: "James Franco, Bryan Cranston, Zoey Deutch",
          mainCategory: "Movie",
          subCategory: "Comedy",
          releaseYear: "2016",
          posterUrl: DEFAULT_POSTER,
          trailerUrl: "",
          description: "A father meets his daughter's strange and overly confident boyfriend."
        },
        {
          title: "Blended",
          platform: "Amazon",
          actors: "Adam Sandler, Drew Barrymore",
          mainCategory: "Movie",
          subCategory: "Romantic comedy",
          releaseYear: "2014",
          posterUrl: "images/blended.jpg",
          trailerUrl: "https://www.youtube.com/watch?v=V6cKLTmDB-k",
          description: "Two single parents are forced to spend time together during a family vacation."
        },
        {
          title: "Baywatch",
          platform: "Netflix",
          actors: "Dwayne Johnson, Zac Efron, Priyanka Chopra",
          mainCategory: "Movie",
          subCategory: "Action, Comedy",
          releaseYear: "2017",
          posterUrl: "images/baywatch.JPG",
          trailerUrl: "https://www.youtube.com/watch?v=eyKOgnaf0BU",
          description: "A team of lifeguards uncover a criminal plot while protecting the beach."
        },
        {
          title: "Neighbours",
          platform: "Amazon",
          actors: "Seth Rogen, Zac Efron, Rose Byrne",
          mainCategory: "Movie",
          subCategory: "Comedy",
          releaseYear: "2014",
          posterUrl: DEFAULT_POSTER,
          trailerUrl: "",
          description: "A couple gets into a rivalry with a noisy fraternity next door."
        },
        {
          title: "Mr. Right",
          platform: "Amazon",
          actors: "Sam Rockwell, Anna Kendrick",
          mainCategory: "Movie",
          subCategory: "Action, Romantic comedy",
          releaseYear: "2015",
          posterUrl: DEFAULT_POSTER,
          trailerUrl: "",
          description: "A woman falls in love with a charming hitman who targets criminals."
        }
      ];

    autoMovies.forEach(obj => {
      this.add(
        new Movie(
          obj.title,
          obj.platform,
          obj.actors,
          obj.mainCategory,
          obj.subCategory,
          obj.releaseYear,
          obj.posterUrl,
          obj.trailerUrl,
          obj.description
        )
      );
    });

    this.sortByTitle();
    this.updateStats();
  }

  add(movie) {
    this.listOfMovies.push(movie); // listOfMovies est un array
  }

  empty() {
    this.listOfMovies = [];
    this.currentPage  = 1;
    this.updateStats();
  }

  removeByTitle(title) {
    for (let i = 0; i < this.listOfMovies.length; i++) {
      if (this.listOfMovies[i].title === title) {
        this.listOfMovies.splice(i, 1);
        break;
      }
    }
    let totalPages = this.getTotalPages();
    if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }
    this.updateStats();
  }

  // sort simple par alphabetical order
  sortByTitle() {
    this.listOfMovies.sort(function (m1, m2) {
      if (m1.title < m2.title) return -1;
      if (m1.title > m2.title) return 1;
      return 0;
    });
  }

  sortByYear() {
    this.listOfMovies.sort(function (m1, m2) {
      let y1 = parseInt(m1.releaseYear) || 0;
      let y2 = parseInt(m2.releaseYear) || 0;
      return y1 - y2;
    });
  }

  load() {
    if (localStorage.movies !== undefined) {
      this.listOfMovies = JSON.parse(localStorage.movies);
      this.currentPage  = 1;
      this.updateStats();
    }
  }

  save() {
    localStorage.movies = JSON.stringify(this.listOfMovies);
  }

  updateStats() {
    let total   = this.listOfMovies.length;
    let movies  = 0;
    let series  = 0;

    this.listOfMovies.forEach(function (m) {
      if (m.mainCategory === "Movie") movies++;
      if (m.mainCategory === "Series") series++;
    });

    document.querySelector("#statsTotal").textContent  = total;
    document.querySelector("#statsMovies").textContent = movies;
    document.querySelector("#statsSeries").textContent = series;
  }

  /* Filtering based on filterType + searchText */

  getFilteredList() {
    let filtered = this.listOfMovies.filter((m) => {
      // filter by type
      if (this.filterType === "movie" && m.mainCategory !== "Movie") return false;
      if (this.filterType === "series" && m.mainCategory !== "Series") return false;

      // search
      if (this.searchText) {
        let fieldValue = "";
      
        switch (this.searchMode) {
          case "platform":
            fieldValue = m.platform || "";
            break;
          case "actors":
            fieldValue = m.actors || "";
            break;
          case "genre":
            fieldValue = m.subCategory || "";
            break;
          default: // title
            fieldValue = m.title || "";
            break;
        }
      
        if (!fieldValue.toLowerCase().includes(this.searchText)) {
          return false;
        }
      }

      return true;
    });

    return filtered;
  }

  /* Pagination functions that I used elsewhre */

  getTotalPages() {
    let length = this.getFilteredList().length;
    if (length === 0) return 1;
    return Math.ceil(length / this.pageSize);
  }

  nextPage() {
    let totalPages = this.getTotalPages();
    if (this.currentPage < totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  updatePaginationControls(totalItems) {
    let prevBtn = document.querySelector("#prevPageBtn");
    let nextBtn = document.querySelector("#nextPageBtn");
    let info    = document.querySelector("#pageInfo");

    if (!prevBtn || !nextBtn || !info) return;

    let totalPages = this.getTotalPages();

    info.textContent = "Page " + this.currentPage + " / " + totalPages +
                       " · " + totalItems + " item(s)";

    // Previous behavior
    if (this.currentPage === 1) {
      prevBtn.disabled = true;
      prevBtn.classList.add("disabled-btn");
    } else {
      prevBtn.disabled = false;
      prevBtn.classList.remove("disabled-btn");
    }

    // Next Behavior
    if (this.currentPage === totalPages || totalItems === 0) {
      nextBtn.disabled = true;
      nextBtn.classList.add("disabled-btn");
    } else {
      nextBtn.disabled = false;
      nextBtn.classList.remove("disabled-btn");
    }
  }

  /* Display */ // Two Types of displaying : Posters and Table

  displayMoviesAsATable(idOfContainer, options) {
    let container = document.querySelector("#" + idOfContainer);
    container.innerHTML = "";

    let data = this.getFilteredList();

    if (data.length === 0) {
      container.innerHTML = "<p style='padding:10px;color:#9ca3af;'>No movies / series to display.</p>";
      this.updatePaginationControls(0);
      return;
    }

    let table = document.createElement("table");

    // header row
    let headerRow = table.insertRow();
    headerRow.innerHTML =
      "<th onclick='mm.sortByTitle(); mm.displayMoviesAsATable(\"movies\");'>Name</th>" +
      "<th>Available on</th>" +
      "<th>Main actors</th>" +
      "<th>Main category</th>" +
      "<th>Sub-category</th>" +
      "<th onclick='mm.sortByYear(); mm.displayMoviesAsATable(\"movies\");'>Release year</th>" +
      "<th>Poster</th>" +
      "<th>Trailer</th>" +
      "<th>Delete</th>";



    // pagination slice
    let startIndex = (this.currentPage - 1) * this.pageSize;
    let endIndex   = startIndex + this.pageSize;
    let pageData   = data.slice(startIndex, endIndex);

    // rows
    pageData.forEach((movie, index) => {
      let row = table.insertRow();
      row.addEventListener("click", (e) => {
        // Don't open modal when clicking delete icon or editing input/label ( Very important bug fixed here )
        if (e.target.closest(".delete-icon")) return;
        if (e.target.closest(".cell-input")) return;
        if (e.target.closest(".cell-label")) return; // label click is for editing
        openMovieModal(movie);
      });

      if (options && options.highlightLast && index === pageData.length - 1) {
        row.classList.add("new-row");
      }

      createEditableCell(row, movie, "title");
      createEditableCell(row, movie, "platform");
      createEditableCell(row, movie, "actors");
      createEditableCell(row, movie, "mainCategory");
      createEditableCell(row, movie, "subCategory");
      createEditableCell(row, movie, "releaseYear");

      // Poster
      let posterCell = row.insertCell();
      if (movie.posterUrl) {
        let img = document.createElement("img");
        img.src = movie.posterUrl;
        img.alt = "Poster of " + movie.title;
        img.className = "poster-img";
        posterCell.appendChild(img);
      } else {
        posterCell.textContent = "No poster";
      }

       // Trailer (YouTube-style button instead of iframe as I faced probs with Iframes)
let trailerCell = row.insertCell();
if (movie.trailerUrl) {
  trailerCell.innerHTML = `
    <button class="youtube-pill" title="Watch trailer">
      <span class="youtube-play">▶</span>
      <span class="youtube-text">Trailer</span>
    </button>
  `;

  const btn = trailerCell.querySelector(".youtube-pill");
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    window.open(movie.trailerUrl, "_blank");
  });
}

      // delete
      let deleteCell = row.insertCell();
      deleteCell.className = "delete-icon";
      deleteCell.innerHTML = "🗑️";
      deleteCell.onclick = () => {
        this.removeByTitle(movie.title);
        this.displayMoviesAsATable("movies");
      };
    });

// adds the table to the div with a small animation
container.appendChild(table);

// a little trigger for fade-in animation each time we rebuild the table
table.classList.add("table-animate");
table.addEventListener("animationend", () => {
  table.classList.remove("table-animate");
}, { once: true });    this.updatePaginationControls(data.length);
  }

  printToConsole() {
    this.listOfMovies.forEach((m) => console.log(m.title));
  }
}


// ==================== Background canvas animation ==================== // ( same as the other project ( CV ) with some color tweaks )

function startCanvasAnimation() {
    const canvas = document.getElementById("bgCanvas");
    const ctx = canvas.getContext("2d");
  
    let width, height;
    const blobs = [];
  
    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
  
    window.addEventListener("resize", resize);
    resize();
  
    class Blob {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.r = 150 + Math.random() * 220;      // MUCH bigger for lava effect
        const angle = Math.random() * Math.PI * 2;
        this.speed = 0.5;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.color1 = `rgba(34,197,94,0.25)`; // green glow (matching theme)
        this.color2 = `rgba(59,130,246,0)`;  // blue fade-out
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
      
        // wrap
        if (this.x < -this.r) this.x = width + this.r;
        if (this.x > width + this.r) this.x = -this.r;
        if (this.y < -this.r) this.y = height + this.r;
        if (this.y > height + this.r) this.y = -this.r;
      }
      draw() {
        const gradient = ctx.createRadialGradient(
          this.x, this.y, this.r * 0.2,
          this.x, this.y, this.r
        );
        gradient.addColorStop(0, this.color1);
        gradient.addColorStop(1, this.color2);
  
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  
    // Generate ~7–9 large blobs
    for (let i = 0; i < 7; i++) blobs.push(new Blob());
  
    function animate() {
      ctx.clearRect(0, 0, width, height);
  
      // Slight dark wash to blend blobs (subtle motion trail)
      ctx.fillStyle = "rgba(2, 6, 23, 0.06)";
      ctx.fillRect(0, 0, width, height);
  
      blobs.forEach(blob => {
        blob.update();
        blob.draw();
      });
  
      requestAnimationFrame(animate);
    }
  
    animate();
  }