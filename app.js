const SUPABASE_URL = "https://rmlrnnktqfzoknsnwrma.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtbHJubmt0cWZ6b2tuc253cm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2OTg5MjgsImV4cCI6MjA5OTI3NDkyOH0.Mxj_gXT_orQvKWbZhlaI7mgLwGdZEpczcCDG3MfrJOo";


const visitorId =
  localStorage.getItem("danutaVisitorId") ||
  crypto.randomUUID();

localStorage.setItem(
  "danutaVisitorId",
  visitorId
);


const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


const list = document.getElementById("gift-list");



async function showGifts() {

  const { data, error } = await supabaseClient
    .from("gifts")
    .select("*")
    .order("id");


  if (error) {
    console.log("Supabase klaida:", error);
    return;
  }


  list.innerHTML = "";


  data.forEach((gift) => {

    const myGift = gift.reserved_by === visitorId;


    const card = document.createElement("div");

    card.className = "card";

    card.onclick = () => openGift(gift.id);


    card.innerHTML = `

      <img src="${gift.image_url}" alt="${gift.title}">


      <div class="content">

        <h3>${gift.title}</h3>

        <p>${gift.price ?? ""}</p>


        <div class="status-space">
          ${
            gift.reserved
            ?
              (
                myGift
                ?
                "Pasirinkai šią dovaną"
                :
                "Rezervuota"
              )
            :
            ""
          }
        </div>


        <p class="preview">
          ${(gift.description || "").slice(0, 90)}
          ${(gift.description && gift.description.length > 90) ? "…" : ""}
        </p>


        ${
          gift.description
          ?
          `
          <p class="more">
            Skaityti daugiau →
          </p>
          `
          :
          ""
        }


        ${
          gift.reserved
          ?
            (
              myGift
              ?
              `
              <button onclick="event.stopPropagation(); cancelReservation(${gift.id})">
                Atšaukti rezervaciją
              </button>
              `
              :
              ""
            )
          :
          `
          <button onclick="event.stopPropagation(); reserveGift(${gift.id})">
            Rezervuoti
          </button>
          `
        }


      </div>

    `;


    list.appendChild(card);

  });

}



async function reserveGift(id) {

const { data: current } = await supabaseClient
  .from("gifts")
  .select("*")
  .eq("reserved_by", visitorId);


if (current && current.length > 0) {

  const addMore = confirm(
    "Jau esi rezervavęs dovaną. Ar nori rezervuoti dar vieną?"
  );


  if (!addMore) {
    return;
  }

}




  const { error } = await supabaseClient
    .from("gifts")
    .update({
      reserved: true,
      reserved_by: visitorId
    })
    .eq("id", id);



  if (error) {
    console.log("Rezervavimo klaida:", error);
    return;
  }


  showGifts();

}




async function openGift(id) {


  const { data, error } = await supabaseClient
    .from("gifts")
    .select("*")
    .eq("id", id)
    .single();



  if (error) {
    console.log(error);
    return;
  }



  document.getElementById("modal-image").src = data.image_url;


  document.getElementById("modal-title").innerText =
    data.title;


  document.getElementById("modal-description").innerText =
    data.description || "Aprašymo nėra.";


  document.getElementById("modal-price").innerText =
    data.price || "";



  const link = document.getElementById("modal-link");


  if (data.link) {

    link.href = data.link;
    link.style.display = "block";

  } else {

    link.style.display = "none";

  }



  const modalButton =
    document.getElementById("modal-reserve");



  if (!data.reserved) {


    modalButton.innerText = "Rezervuoti";

    modalButton.style.display = "block";


    modalButton.onclick = async function () {

      await reserveGift(data.id);

      closeGift();

    };


  }

  else if (data.reserved_by === visitorId) {


    modalButton.innerText = "Atšaukti rezervaciją";

    modalButton.style.display = "block";


    modalButton.onclick = async function () {

      await cancelReservation(data.id);

      closeGift();

    };


  }

  else {


    modalButton.innerText = "Rezervuota";

    modalButton.style.display = "block";

    modalButton.onclick = null;

  }



  const modal = document.getElementById("gift-modal");  
  console.log("MODAL ELEMENTAS:", modal);  
  modal.style.display = "flex";


}





function closeGift() {

  document.getElementById("gift-modal").style.display = "none";

}

document.getElementById("gift-modal").onclick = function(event) {

  if (event.target === this) {
    closeGift();
  }

};


async function cancelReservation(id) {


  const { error } = await supabaseClient
    .from("gifts")
    .update({
      reserved: false,
      reserved_by: null
    })
    .eq("id", id)
    .eq("reserved_by", visitorId);



  if (error) {

    console.log("Atšaukimo klaida:", error);

    return;

  }


  showGifts();

}



showGifts();

console.log("NUOTRAUKOS KODAS VEIKIA");

document.addEventListener("DOMContentLoaded", function () {

  const photo = document.getElementById("danuta-photo");
  const photoModal = document.getElementById("photo-modal");

  if (!photo || !photoModal) {
    console.log("Nuotraukos modalas nerastas");
    return;
  }

  photo.onclick = function () {
    photoModal.style.display = "flex";
  };

  photoModal.onclick = function () {
    photoModal.style.display = "none";
  };

});
