function openAppeal() {
            const message = `📝 MUROJAT TIZIMI

Murojatingizni qoldiring:

✓ Ekologik muammolar haqida xabar berish
✓ Takliflar va shikoyatlar yuborish
✓ Foto/video materiallar biriktirish
✓ Holat kuzatuvi va SMS xabarnomalar
✓ 24 soat ichida dastlabki javob
✓ 3 kun ichida to'liq tahlil

Sizning murojatingiz maxfiy va professional ko'rib chiqiladi!

Tizimga o'tmoqdasiz...`;

            alert(message);
        }

        function openLogin() {
            const message = `🔐 DAVLAT TASHKILOTLARI KIRISHI

Bu bo'lim faqat davlat tashkilotlari va hamkor idoralar uchun mo'ljallangan.

Kirish uchun:
✓ Tashkilot logini
✓ Maxsus parol
✓ Ikki bosqichli tasdiqlash

Davlat tashkilotlari uchun maxsus dashboard, monitoring va hisobotlar tizimi mavjud.

Kirish tizimiga o'tmoqdasiz...`;

            alert(message);
        }

function showAppeals() {
    const modal = document.getElementById("appealsModal");
    const list = document.getElementById("appealsList");

    modal.style.display = "block";
    list.innerHTML = "Yuklanmoqda...";

    fetch("http://127.0.0.1:8000/api/v1/applications/")
        .then(response => response.json())
        .then(data => {
            if (!data || data.length === 0) {
                list.innerHTML = "<p>Murojatlar mavjud emas</p>";
                return;
            }

            let html = "";

            data.forEach(app => {
                const statusColor =
                    app.status === "COMPLETED" ? "#2e7d32" : "#f9a825";

                const statusText =
                    app.status === "COMPLETED" ? "Hal qilingan" : "Jarayonda";

                html += `
                    <div class="appeal-card">
                        ${app.image ? `<img src="${app.image}" class="appeal-image">` : ""}

                        <div class="appeal-body">
                            <h4>📍 ${app.region}${app.district ? " / " + app.district : ""}</h4>

                            <p>${app.description ?? "Tavsif mavjud emas"}</p>

                            <span class="status-badge" style="background:${statusColor}">
                                ${statusText}
                            </span>
                        </div>
                    </div>
                `;
            });

            list.innerHTML = html;
        })
        .catch(error => {
            console.error(error);
            list.innerHTML = "Xatolik yuz berdi";
        });
}

function closeAppeals() {
    document.getElementById("appealsModal").style.display = "none";
}



        function showInfo(service) {
            const services = {
                monitoring: '🌱 EKOLOGIK MONITORING\n\nReal vaqt rejimida atrof-muhit holatini kuzatish, tahlil qilish va hisobotlar tayyorlash xizmatlari. Professional asboblar va mutaxassislar jamoasi.',
                education: '📚 TA\'LIM DASTURLARI\n\nEkologik savodxonlikni oshirish, treninglar, seminarlar va onlayn kurslar. Sertifikat olish imkoniyati mavjud.',
                lab: '🔬 LABORATORIYA TAHLILI\n\nTuproq, suv va havo sifatini professional tahlil qilish. Akkreditatsiyalangan laboratoriya va xalqaro standartlar.'
            };

            alert(services[service] || 'Ma\'lumot yuklanmoqda...');
        }

        // Entrance animations
        document.addEventListener('DOMContentLoaded', function() {
            const elements = document.querySelectorAll('.main-appeal-card, .service-card, .add-service-card');

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }, index * 100);
                    }
                });
            }, { threshold: 0.1 });

            elements.forEach(element => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.transition = 'all 0.6s ease';
                observer.observe(element);
            });
        });
function loadAppeals() {
    fetch("http://127.0.0.1:8000/api/v1/applications/")
        .then(res => res.json())
        .then(data => {
            const box = document.getElementById("appeals");
            box.innerHTML = "";

            data.forEach(app => {
                box.innerHTML += `
                <div class="card">
                    <img src="${app.image}" width="250"><br><br>
                    <b>Ism:</b> ${app.fullname}<br>
                    <b>Hudud:</b> ${app.region_name}<br>
                    <b>Tuman:</b> ${app.district_name || "-"}<br>
                    <b>Holat:</b> ${app.status}<br>
                    <b>Izoh:</b> ${app.description || "-"}
                </div>
                `;
            });
        })
        .catch(err => console.error("Xatolik:", err));
}
