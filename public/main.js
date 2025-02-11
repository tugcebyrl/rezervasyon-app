 // Toastr Başlatma Konfigürasyonu
 toastr.options = {
    "closeButton": true, // Kapanma butonu
    "debug": false,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-top-right", // Toast konumu
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "300", // Göstermek için geçen süre
    "hideDuration": "1000", // Gizlemek için geçen süre
    "timeOut": "5000", // Görünürlük süresi
    "extendedTimeOut": "1000"
};
console.log(toastr);

// Kullanıcı girişlerini tutan değişken
let rezervasyonlar = [];
let duzenlenenRezId = null; // Düzenlenen rezervasyon ID'si

document.addEventListener("DOMContentLoaded", function() {
    const rezervasyonForm = document.getElementById("rez-form");
    const rezervasyonList = document.getElementById("rez-list");

    // Rezervasyon ekleme veya güncelleme fonksiyonu
    function rezEkleGuncelle(isim, tarih, zaman, misafir) {
        if (!isim || !tarih || !zaman || isNaN(misafir) || misafir < 1) {
            toastr.error("Lütfen tüm alanları eksiksiz doldurun!", "Hata");
            return;
        }

        if (duzenlenenRezId !== null) {
            // Güncelleme işlemi
            const rezervasyon = {
                id: duzenlenenRezId,
                isim,
                tarih,
                zaman,
                misafir
            };
            socket.send(JSON.stringify({ type: "guncelle", rezervasyon }));
            toastr.info("Rezervasyon güncellendi!", "Güncellendi");
            duzenlenenRezId = null; 
        } else {
            // Yeni rezervasyon ekleme
            const rezervasyon = {
                id: rezervasyonlar.length + 1,
                isim,
                tarih,
                zaman,
                misafir
            };
            socket.send(JSON.stringify({ type: "ekle", rezervasyon }));
            toastr.success("Rezervasyon başarıyla eklendi!", "Başarılı");
        }

        rezervasyonForm.reset();
    }

    // Rezervasyon iptal etme fonksiyonu
    function rezIptal(id) {
        socket.send(JSON.stringify({ type: "iptal", id }));
        toastr.warning("Rezervasyon iptal edildi.", "İptal Edildi");
    }

    // Rezervasyon düzenleme fonksiyonu
    function rezDuzenle(id) {
        const rez = rezervasyonlar.find(r => r.id === id);
        if (rez) {
            document.getElementById("isim").value = rez.isim;
            document.getElementById("tarih").value = rez.tarih;
            document.getElementById("zaman").value = rez.zaman;
            document.getElementById("misafir").value = rez.misafir;
            duzenlenenRezId = id;
            toastr.info("Rezervasyonu düzenliyorsunuz.", "Düzenleme Modu");
        }
    }

    // UI güncelleme fonksiyonu
    function updateUI() {
        rezervasyonList.innerHTML = "";
        rezervasyonlar.forEach(rezervasyon => {
            const li = document.createElement("li");
            li.textContent = `${rezervasyon.isim} - ${rezervasyon.tarih} - ${rezervasyon.zaman} - ${rezervasyon.misafir} kişi`;

            // İptal butonu
            const cancelBtn = document.createElement("button");
            cancelBtn.textContent = "İptal Et";
            cancelBtn.onclick = function () {
                rezIptal(rezervasyon.id);
            };

            // Düzenleme butonu
            const editBtn = document.createElement("button");
            editBtn.textContent = "Düzenle";
            editBtn.onclick = function () {
                rezDuzenle(rezervasyon.id);
            };

            li.appendChild(editBtn);
            li.appendChild(cancelBtn);
            rezervasyonList.appendChild(li);
        });
    }

    // Form submit event
    rezervasyonForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const name = document.getElementById("isim").value.trim();
        const date = document.getElementById("tarih").value;
        const time = document.getElementById("zaman").value;
        const guest = parseInt(document.getElementById("misafir").value);

        rezEkleGuncelle(name, date, time, guest);
    });

    // WebSocket ile gerçek zamanlı veri güncelleme
    const socket = new WebSocket("wss://" + window.location.host);

    socket.onmessage = function(event) {
        rezervasyonlar = JSON.parse(event.data);
        updateUI();
    };
});
