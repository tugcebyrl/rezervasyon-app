// Kullanıcı girişlerini tutan değişken

let rezervasyonlar=[]


document.addEventListener("DOMContentLoaded", function() {
    const rezervasyonForm = document.getElementById("rez-form");
    const rezervasyonList = document.getElementById("rez-list");

    // Rezervasyon ekleme fonksiyonu
    function rezEkle(isim,tarih,zaman,misafir){
        const rezervasyon={
            id: rezervasyonlar.length +1,
            isim,
            tarih,
            zaman,
            misafir
        };
        
        socket.send(JSON.stringify({ type: "ekle", rezervasyon }));
    }

    // Rezervasyon Görüntüleme
    function rezGoruntu(){
        return rezervasyonlar
    }

    // Rezervasyon iptal etme
    function rezIptal(id) {
        rezervasyonlar = rezervasyonlar.filter(rezervasyon => rezervasyon.id !== id);
        socket.send(JSON.stringify({ type: "iptal", id }));
        updateUI();
    }

    // UI güncelleme
    function updateUI(){
        rezervasyonList.innerHTML=""
        rezervasyonlar.forEach(rezervasyon=>{
            const li=document.createElement("li")
            li.textContent=`${rezervasyon.isim} - ${rezervasyon.tarih} - ${rezervasyon.zaman} - ${rezervasyon.misafir} kişi`

            // Rezervasyon İptal butonu
            const cancelBtn = document.createElement("button");
            cancelBtn.textContent = "İptal Et";
            cancelBtn.onclick = function () {
            rezIptal(rezervasyon.id); 
        };

            li.appendChild(cancelBtn); // Butonu liste elemanına ekle
            rezervasyonList.appendChild(li);
        })
    }
    
    rezervasyonForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const name = document.getElementById("isim").value;
        const date = document.getElementById("tarih").value;
        const time = document.getElementById("zaman").value;
        const guest = parseInt(document.getElementById("misafir").value);
        rezEkle(name, date, time, guest);
        rezervasyonForm.reset();
    });

    // WebSocket ile gerçek zamanlı veri güncelleme
    const socket = new WebSocket("wss://" + window.location.host);

    socket.onmessage = function(event) {
        rezervasyonlar = JSON.parse(event.data);
        updateUI();
    };
});
