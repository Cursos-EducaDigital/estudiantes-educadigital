
(() => {
  "use strict";

  // Ciudades principales de Estados Unidos y sus zonas horarias.
  const cityData = [
    ["Alabama","AL","America/Chicago","Birmingham;Montgomery;Mobile;Huntsville;Tuscaloosa;Hoover;Auburn;Dothan;Decatur;Madison"],
    ["Alaska","AK","America/Anchorage","Anchorage;Fairbanks;Juneau;Sitka;Ketchikan;Wasilla;Kenai;Kodiak;Bethel;Palmer"],
    ["Arizona","AZ","America/Phoenix","Phoenix;Tucson;Mesa;Chandler;Scottsdale;Glendale;Gilbert;Tempe;Peoria;Flagstaff;Yuma;Prescott;Lake Havasu City"],
    ["Arkansas","AR","America/Chicago","Little Rock;Fort Smith;Fayetteville;Springdale;Jonesboro;Conway;Rogers;Bentonville;Pine Bluff;Hot Springs"],
    ["California","CA","America/Los_Angeles","Los Angeles;San Diego;San Jose;San Francisco;Fresno;Sacramento;Long Beach;Oakland;Bakersfield;Anaheim;Santa Ana;Riverside;Stockton;Irvine;Chula Vista;Fremont;Santa Clarita;San Bernardino;Modesto;Fontana;Oxnard;Moreno Valley;Glendale;Huntington Beach;Santa Rosa;Ontario;Rancho Cucamonga;Oceanside;Elk Grove;Corona;Lancaster;Palmdale;Salinas;Hayward;Pomona;Escondido;Sunnyvale;Torrance;Pasadena;Fullerton;Orange;Visalia;Roseville;Concord;Santa Clara;Simi Valley;Thousand Oaks;Berkeley;Vallejo;Victorville;Fairfield;Carlsbad;Murrieta;Temecula;Santa Cruz;Redding;Chico;Eureka"],
    ["Colorado","CO","America/Denver","Denver;Colorado Springs;Aurora;Fort Collins;Lakewood;Thornton;Arvada;Westminster;Pueblo;Greeley;Boulder;Longmont;Grand Junction;Loveland;Broomfield;Castle Rock"],
    ["Connecticut","CT","America/New_York","Bridgeport;New Haven;Stamford;Hartford;Waterbury;Norwalk;Danbury;New Britain;West Hartford;Greenwich;Bristol;Meriden"],
    ["Delaware","DE","America/New_York","Wilmington;Dover;Newark;Middletown;Smyrna;Milford;Seaford;Georgetown"],
    ["Florida","FL","America/New_York","Miami;Orlando;Tampa;Jacksonville;St. Petersburg;Hialeah;Tallahassee;Fort Lauderdale;Port St. Lucie;Cape Coral;Pembroke Pines;Hollywood;Miramar;Gainesville;Coral Springs;Clearwater;Palm Bay;West Palm Beach;Lakeland;Pompano Beach;Miami Gardens;Davie;Boca Raton;Sunrise;Plantation;Deltona;Largo;Deerfield Beach;Melbourne;Daytona Beach;Kissimmee;Ocala;Sarasota;Naples;Fort Myers;Bradenton"],
    ["Florida","FL","America/Chicago","Pensacola;Panama City;Destin;Fort Walton Beach"],
    ["Georgia","GA","America/New_York","Atlanta;Augusta;Columbus;Macon;Savannah;Athens;Sandy Springs;Roswell;Johns Creek;Warner Robins;Albany;Alpharetta;Marietta;Valdosta;Smyrna;Dunwoody;Gainesville;Rome"],
    ["Hawaii","HI","Pacific/Honolulu","Honolulu;Hilo;Kailua;Kapolei;Kaneohe;Waipahu;Pearl City;Kahului;Lihue"],
    ["Idaho","ID","America/Boise","Boise;Meridian;Nampa;Idaho Falls;Pocatello;Caldwell;Twin Falls;Rexburg"],
    ["Idaho","ID","America/Los_Angeles","Moscow;Sandpoint;Bonners Ferry;Coeur d'Alene;Lewiston;Post Falls"],
    ["Illinois","IL","America/Chicago","Chicago;Aurora;Naperville;Joliet;Rockford;Springfield;Elgin;Peoria;Champaign;Waukegan;Cicero;Bloomington;Arlington Heights;Evanston;Schaumburg;Decatur;Bolingbrook;Palatine;Skokie;Des Plaines;Orland Park"],
    ["Indiana","IN","America/Indiana/Indianapolis","Indianapolis;Fort Wayne;South Bend;Carmel;Fishers;Bloomington;Lafayette;Muncie;Noblesville;Terre Haute;Kokomo;Anderson;Elkhart;Mishawaka;Greenwood"],
    ["Indiana","IN","America/Chicago","Evansville;Hammond;Gary;East Chicago;Merrillville"],
    ["Iowa","IA","America/Chicago","Des Moines;Cedar Rapids;Davenport;Sioux City;Iowa City;Waterloo;Ames;West Des Moines;Ankeny;Council Bluffs;Dubuque;Urbandale;Marion;Bettendorf"],
    ["Kansas","KS","America/Chicago","Wichita;Overland Park;Kansas City;Olathe;Topeka;Lawrence;Shawnee;Manhattan;Lenexa;Salina;Hutchinson;Leavenworth;Dodge City"],
    ["Kansas","KS","America/Denver","Goodland;Sharon Springs;St. Francis"],
    ["Kentucky","KY","America/New_York","Lexington;Louisville;Covington;Richmond;Georgetown;Florence;Nicholasville;Elizabethtown;Frankfort"],
    ["Kentucky","KY","America/Chicago","Bowling Green;Paducah;Henderson;Owensboro;Hopkinsville;Madisonville;Murray"],
    ["Louisiana","LA","America/Chicago","New Orleans;Baton Rouge;Shreveport;Lafayette;Lake Charles;Kenner;Bossier City;Monroe;Alexandria;Houma;Slidell"],
    ["Maine","ME","America/New_York","Portland;Lewiston;Bangor;South Portland;Auburn;Biddeford;Sanford;Augusta;Saco;Westbrook"],
    ["Maryland","MD","America/New_York","Baltimore;Frederick;Gaithersburg;Rockville;Bowie;Hagerstown;Annapolis;College Park;Salisbury;Laurel;Greenbelt;Silver Spring"],
    ["Massachusetts","MA","America/New_York","Boston;Worcester;Springfield;Cambridge;Lowell;Brockton;Quincy;Lynn;New Bedford;Fall River;Newton;Lawrence;Somerville;Framingham;Haverhill;Waltham;Malden;Medford;Taunton;Chicopee"],
    ["Michigan","MI","America/Detroit","Detroit;Grand Rapids;Warren;Sterling Heights;Ann Arbor;Lansing;Flint;Dearborn;Livonia;Westland;Troy;Farmington Hills;Kalamazoo;Wyoming;Southfield;Rochester Hills;Battle Creek;Saginaw;Muskegon;Bay City;Traverse City"],
    ["Michigan","MI","America/Menominee","Iron Mountain;Menominee;Escanaba;Ironwood"],
    ["Minnesota","MN","America/Chicago","Minneapolis;Saint Paul;Rochester;Duluth;Bloomington;Brooklyn Park;Plymouth;Woodbury;Maple Grove;Eagan;St. Cloud;Burnsville;Eden Prairie;Coon Rapids;Minnetonka"],
    ["Mississippi","MS","America/Chicago","Jackson;Gulfport;Southaven;Hattiesburg;Biloxi;Meridian;Tupelo;Olive Branch;Greenville;Madison"],
    ["Missouri","MO","America/Chicago","Kansas City;St. Louis;Springfield;Columbia;Independence;Lee's Summit;O'Fallon;St. Joseph;St. Charles;Blue Springs;Joplin;Florissant;Chesterfield;Jefferson City"],
    ["Montana","MT","America/Denver","Billings;Missoula;Great Falls;Bozeman;Butte;Helena;Kalispell;Havre;Anaconda;Miles City"],
    ["Nebraska","NE","America/Chicago","Omaha;Lincoln;Bellevue;Grand Island;Kearney;Fremont;Hastings;Norfolk;Columbus;North Platte"],
    ["Nebraska","NE","America/Denver","Scottsbluff;Alliance;Chadron"],
    ["Nevada","NV","America/Los_Angeles","Las Vegas;Henderson;Reno;North Las Vegas;Sparks;Carson City;Elko;Mesquite;Boulder City;Fernley"],
    ["New Hampshire","NH","America/New_York","Manchester;Nashua;Concord;Dover;Rochester;Keene;Portsmouth;Laconia;Lebanon"],
    ["New Jersey","NJ","America/New_York","Newark;Jersey City;Paterson;Elizabeth;Edison;Woodbridge;Lakewood;Toms River;Hamilton;Trenton;Clifton;Camden;Brick;Cherry Hill;Passaic;Union City;Bayonne;East Orange;Vineland;New Brunswick;Hoboken;West New York"],
    ["New Mexico","NM","America/Denver","Albuquerque;Las Cruces;Rio Rancho;Santa Fe;Roswell;Farmington;Clovis;Hobbs;Alamogordo;Carlsbad"],
    ["New York","NY","America/New_York","New York;Buffalo;Rochester;Yonkers;Syracuse;Albany;New Rochelle;Mount Vernon;Schenectady;Utica;White Plains;Troy;Niagara Falls;Binghamton;Ithaca;Poughkeepsie;Jamestown;Saratoga Springs"],
    ["North Carolina","NC","America/New_York","Charlotte;Raleigh;Greensboro;Durham;Winston-Salem;Fayetteville;Cary;Wilmington;High Point;Concord;Asheville;Gastonia;Jacksonville;Chapel Hill;Rocky Mount;Burlington;Huntersville;Kannapolis;Apex;Hickory;Greenville;Wilson"],
    ["North Dakota","ND","America/Chicago","Fargo;Bismarck;Grand Forks;Minot;West Fargo;Mandan;Dickinson;Jamestown;Wahpeton"],
    ["North Dakota","ND","America/Denver","Williston;Watford City"],
    ["Ohio","OH","America/New_York","Columbus;Cleveland;Cincinnati;Toledo;Akron;Dayton;Parma;Canton;Youngstown;Lorain;Hamilton;Springfield;Kettering;Elyria;Lakewood;Dublin;Mansfield;Newark;Findlay;Lima"],
    ["Oklahoma","OK","America/Chicago","Oklahoma City;Tulsa;Norman;Broken Arrow;Edmond;Lawton;Moore;Midwest City;Enid;Stillwater;Muskogee;Bartlesville"],
    ["Oregon","OR","America/Los_Angeles","Portland;Salem;Eugene;Gresham;Hillsboro;Beaverton;Bend;Medford;Springfield;Corvallis;Albany;Tigard;Lake Oswego;Grants Pass;Oregon City;Redmond"],
    ["Oregon","OR","America/Boise","Ontario"],
    ["Pennsylvania","PA","America/New_York","Philadelphia;Pittsburgh;Allentown;Reading;Erie;Scranton;Bethlehem;Lancaster;Harrisburg;York;Wilkes-Barre;Chester;Williamsport;State College;Altoona;Norristown;Levittown;West Chester"],
    ["Rhode Island","RI","America/New_York","Providence;Warwick;Cranston;Pawtucket;East Providence;Woonsocket;Newport;Central Falls"],
    ["South Carolina","SC","America/New_York","Charleston;Columbia;North Charleston;Mount Pleasant;Rock Hill;Greenville;Summerville;Sumter;Hilton Head Island;Spartanburg;Florence;Goose Creek"],
    ["South Dakota","SD","America/Chicago","Sioux Falls;Aberdeen;Brookings;Watertown;Mitchell;Yankton;Pierre"],
    ["South Dakota","SD","America/Denver","Rapid City;Spearfish;Sturgis;Deadwood"],
    ["Tennessee","TN","America/Chicago","Memphis;Nashville;Clarksville;Murfreesboro;Jackson;Bartlett;Hendersonville;Collierville;Cleveland;Smyrna;Franklin"],
    ["Tennessee","TN","America/New_York","Knoxville;Chattanooga;Johnson City;Kingsport;Bristol;Morristown"],
    ["Texas","TX","America/Chicago","Houston;San Antonio;Dallas;Austin;Fort Worth;Arlington;Corpus Christi;Plano;Laredo;Lubbock;Garland;Irving;Amarillo;Grand Prairie;Brownsville;McKinney;Frisco;Pasadena;Mesquite;Killeen;McAllen;Waco;Carrollton;Denton;Midland;Abilene;Beaumont;Round Rock;Odessa;Wichita Falls;Richardson;Lewisville;Tyler;College Station;Pearland;Sugar Land;The Woodlands;Harlingen;Galveston"],
    ["Texas","TX","America/Denver","El Paso"],
    ["Utah","UT","America/Denver","Salt Lake City;West Valley City;Provo;West Jordan;Orem;Sandy;St. George;Ogden;Layton;South Jordan;Lehi;Murray;Bountiful;Logan;Park City"],
    ["Vermont","VT","America/New_York","Burlington;South Burlington;Rutland;Barre;Montpelier;Winooski;St. Albans"],
    ["Virginia","VA","America/New_York","Virginia Beach;Chesapeake;Norfolk;Richmond;Newport News;Alexandria;Hampton;Roanoke;Portsmouth;Suffolk;Lynchburg;Harrisonburg;Charlottesville;Leesburg;Manassas;Petersburg;Fredericksburg;Arlington;Fairfax;Reston"],
    ["Washington","WA","America/Los_Angeles","Seattle;Spokane;Tacoma;Vancouver;Bellevue;Kent;Everett;Renton;Spokane Valley;Federal Way;Yakima;Kirkland;Bellingham;Kennewick;Auburn;Pasco;Marysville;Redmond;Sammamish;Olympia;Wenatchee"],
    ["West Virginia","WV","America/New_York","Charleston;Huntington;Morgantown;Parkersburg;Wheeling;Weirton;Fairmont;Martinsburg;Beckley;Clarksburg"],
    ["Wisconsin","WI","America/Chicago","Milwaukee;Madison;Green Bay;Kenosha;Racine;Appleton;Waukesha;Eau Claire;Oshkosh;Janesville;West Allis;La Crosse;Sheboygan;Wauwatosa;Fond du Lac;Brookfield;New Berlin;Beloit"],
    ["Wyoming","WY","America/Denver","Cheyenne;Casper;Laramie;Gillette;Rock Springs;Sheridan;Green River;Evanston;Riverton;Jackson"],
    ["Washington D. C.","DC","America/New_York","Washington"]
  ];

  const stateSelect = document.getElementById("state-select");
  const cityInput = document.getElementById("city-search");
  const cityOptions = document.getElementById("city-options");
  const form = document.getElementById("city-form");
  const message = document.getElementById("form-message");
  const result = document.getElementById("schedule-result");
  const selectedLocation = document.getElementById("selected-location");
  const localTime = document.getElementById("local-time");
  const argentinaTime = document.getElementById("argentina-time");
  const dateNote = document.getElementById("date-note");
  const yearElement = document.getElementById("current-year");

  // Construye la lista completa de ciudades a partir de los datos.
  const cities = [];

  cityData.forEach(([state, abbreviation, timeZone, names]) => {
    names.split(";").forEach(name => {
      cities.push({
        name: name.trim(),
        state,
        abbreviation,
        timeZone
      });
    });
  });

  const uniqueCities = [
    ...new Map(
      cities.map(city => [
        `${city.name}|${city.abbreviation}|${city.timeZone}`,
        city
      ])
    ).values()
  ];

  // Carga los estados en el selector.
  const stateNames = [...new Set(uniqueCities.map(city => city.state))]
    .sort((a, b) => a.localeCompare(b, "es"));

  stateNames.forEach(state => {
    const option = document.createElement("option");
    option.value = state;
    option.textContent = state;
    stateSelect.appendChild(option);
  });

  function normalized(value) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  // Muestra las ciudades correspondientes al estado elegido.
  function refreshCityOptions() {
    const chosenState = stateSelect.value;

    const filtered = uniqueCities
      .filter(city => !chosenState || city.state === chosenState)
      .sort((a, b) => a.name.localeCompare(b.name, "es"));

    cityOptions.replaceChildren();

    filtered.forEach(city => {
      const option = document.createElement("option");
      option.value = `${city.name}, ${city.abbreviation}`;
      cityOptions.appendChild(option);
    });
  }

  stateSelect.addEventListener("change", () => {
    cityInput.value = "";
    refreshCityOptions();
    message.textContent = "";
    result.hidden = true;
  });

  refreshCityOptions();

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  const ARGENTINA_ZONE = "America/Argentina/Buenos_Aires";

  // Obtiene la fecha de una zona horaria determinada.
  function datePartsInZone(date, timeZone) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date);

    return Object.fromEntries(
      parts
        .filter(part => part.type !== "literal")
        .map(part => [part.type, Number(part.value)])
    );
  }

  // Obtiene la hora de una zona horaria determinada.
  function timePartsInZone(date, timeZone) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(date);

    return Object.fromEntries(
      parts
        .filter(part => part.type !== "literal")
        .map(part => [part.type, Number(part.value)])
    );
  }

  // Convierte una hora local en un instante UTC.
  function zonedTimeToUtc(year, month, day, hour, minute, timeZone) {
    const desiredUtc = Date.UTC(year, month - 1, day, hour, minute);
    let guess = desiredUtc;

    for (let i = 0; i < 4; i++) {
      const currentDate = new Date(guess);
      const actualTime = timePartsInZone(currentDate, timeZone);
      const actualDate = datePartsInZone(currentDate, timeZone);

      const representedUtc = Date.UTC(
        actualDate.year,
        actualDate.month - 1,
        actualDate.day,
        actualTime.hour,
        actualTime.minute
      );

      guess += desiredUtc - representedUtc;
    }

    return new Date(guess);
  }

  // Suma días sin depender de la zona horaria del dispositivo.
  function addDays(year, month, day, days) {
    const date = new Date(
      Date.UTC(year, month - 1, day + days)
    );

    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate()
    };
  }

  // Busca el próximo sábado o domingo de clases en Argentina.
  function nextClassDate(targetWeekday, now) {
    const today = datePartsInZone(now, ARGENTINA_ZONE);

    const todayDate = new Date(
      Date.UTC(today.year, today.month - 1, today.day)
    );

    const currentWeekday = todayDate.getUTCDay();

    let difference =
      (targetWeekday - currentWeekday + 7) % 7;

    const todayAtTen = zonedTimeToUtc(
      today.year,
      today.month,
      today.day,
      10,
      0,
      ARGENTINA_ZONE
    );

    if (
      difference === 0 &&
      now.getTime() >= todayAtTen.getTime()
    ) {
      difference = 7;
    }

    return addDays(
      today.year,
      today.month,
      today.day,
      difference
    );
  }

  function formatLocalTime(date, timeZone) {
    return new Intl.DateTimeFormat("es", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(date);
  }

  function formatLocalDate(date, timeZone) {
    return new Intl.DateTimeFormat("es", {
      timeZone,
      weekday: "long",
      day: "numeric",
      month: "long"
    }).format(date);
  }

  function formatArgentinaTime(date) {
    return new Intl.DateTimeFormat("es", {
      timeZone: ARGENTINA_ZONE,
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(date);
  }

  // Busca la ciudad y comprueba el estado seleccionado.
  function findCity(input) {
    const raw = String(input || "").trim();

    if (!raw) return null;

    const pieces = raw.split(",");
    const cityName = normalized(pieces[0] || "");

    const stateCode = pieces.length > 1
      ? pieces.slice(1).join(",").trim().toUpperCase()
      : null;

    if (!cityName) return null;

    return uniqueCities.find(city =>
      normalized(city.name) === cityName &&
      (!stateCode || city.abbreviation === stateCode) &&
      (!stateSelect.value || city.state === stateSelect.value)
    ) || null;
  }

  // Procesa la consulta del estudiante.
  form.addEventListener("submit", event => {
    event.preventDefault();

    const city = findCity(cityInput.value);

    if (!city) {
      message.textContent =
        "No encontramos esa ciudad en la lista. Selecciona una opción sugerida e inténtalo nuevamente.";

      result.hidden = true;
      cityInput.focus();
      return;
    }

    const now = new Date();

    const saturday = nextClassDate(6, now);
    const sunday = nextClassDate(0, now);

    // Las clases siempre comienzan a las 10:00 de Argentina.
    const saturdayInstant = zonedTimeToUtc(
      saturday.year,
      saturday.month,
      saturday.day,
      10,
      0,
      ARGENTINA_ZONE
    );

    const sundayInstant = zonedTimeToUtc(
      sunday.year,
      sunday.month,
      sunday.day,
      10,
      0,
      ARGENTINA_ZONE
    );

    // Convierte los horarios a la zona local de la ciudad.
    const saturdayTime = formatLocalTime(
      saturdayInstant,
      city.timeZone
    );

    const sundayTime = formatLocalTime(
      sundayInstant,
      city.timeZone
    );

    const saturdayDate = formatLocalDate(
      saturdayInstant,
      city.timeZone
    );

    const sundayDate = formatLocalDate(
      sundayInstant,
      city.timeZone
    );

    selectedLocation.textContent =
      `${city.name}, ${city.abbreviation}`;

    localTime.textContent = saturdayTime === sundayTime
      ? saturdayTime
      : `Sábado: ${saturdayTime} · Domingo: ${sundayTime}`;

    argentinaTime.textContent = "10:00 a. m.";

    dateNote.textContent =
      `Próximas clases: ${saturdayDate} y ${sundayDate}. ` +
      `En Argentina: ${formatArgentinaTime(saturdayInstant)} y ` +
      `${formatArgentinaTime(sundayInstant)}. ` +
      `Zona horaria aplicada: ${city.timeZone}.`;

    message.textContent = "";
    result.hidden = false;

    result.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  });
})();
