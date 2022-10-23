const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const lerp = (start, end, alpha) => start + (end - start) * alpha;
const pickRandom = (list) => list[Math.floor(Math.random() * list.length)]; /* Math.random() can never be 1 so flooring it ensures we're in range */
const uid = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

let isBodyHidden = true;
let skewingId = "";

class CardSkew {
    constructor(element, angleSkew, skewSpeed, perspective, skewInRange, scaleInRange, globalOnceOnly) {
        let thisPtr = this;
        this.element = element;
        this.angleSkew = angleSkew;
        this.skewSpeed = skewSpeed;
        this.perspective = perspective;
        this.skewInRange = skewInRange;
        this.scaleInRange = scaleInRange;

        this.Width = 0;
        this.Height = 0;
        this.WidthH = 0;
        this.HeightH = 0;
        this.RcpWidthH = 0;
        this.RcpHeightH = 0;

        this.targetRotateX = 0;
        this.targetRotateY = 0;
        this.currentRotateX = 0;
        this.currentRotateY = 0;

        this.isInRange = false;
        this.dynScale = 1;

        this.unique = ""

        this.update_card_properties();
        addEventListener('resize', this.update_card_properties);
        addEventListener('mousemove', (event) => {
            const rect = this.element.getBoundingClientRect();

            /* respect 3d transform */
            const dynWidthH = this.WidthH * this.dynScale;
            const dynHeightH = this.HeightH * this.dynScale;

            const cardCenterX = dynWidthH + rect.left;
            const cardCenterY = dynHeightH + rect.top;

            const xDisplacement = event.clientX - cardCenterX;
            const yDisplacement = event.clientY - cardCenterY;

            this.isInRange = Math.abs(xDisplacement) <= dynWidthH && Math.abs(yDisplacement) <= dynHeightH;
            if (globalOnceOnly && !this.isInRange) {
                skewingId = "";
            }
            if (globalOnceOnly && skewingId == "" && this.isInRange) {
                this.unique = uid();
                skewingId = this.unique;
            } else if (globalOnceOnly && !(skewingId == this.unique)) {
                this.isInRange = false;
                this.targetRotateX = 0;
                this.targetRotateY = 0;
                this.update();
                return null;
            }

            const relativeX = clamp(xDisplacement, -dynWidthH, dynWidthH);
            const relativeY = clamp(yDisplacement, -dynHeightH, dynHeightH);

            this.targetRotateX = this.angleSkew * relativeY * this.RcpHeightH;
            this.targetRotateY = -this.angleSkew * relativeX * this.RcpWidthH;

            this.update();
        });
    }
    update_card_properties() {
        if (this.element == null) {
            return null; // DOM reload detected; fallback
        }
        this.Width = this.element.offsetWidth;
        this.Height = this.element.offsetHeight;
        this.WidthH = this.Width * 0.5;
        this.HeightH = this.Height * 0.5;
        this.RcpWidthH = 1 / this.WidthH;
        this.RcpHeightH = 1 / this.HeightH;
    }
    update() {
        let thisPtr = this;
        if (this.element == null) {
            return null; // DOM reload detected; fallback
        }
        if (this.skewInRange && !this.isInRange) {
            this.dynScale = lerp(this.dynScale, 1, this.skewSpeed);
            this.targetRotateX = 0;
            this.targetRotateY = 0;
            this.currentRotateX = lerp(this.currentRotateX, this.targetRotateX, this.skewSpeed);
            this.currentRotateY = lerp(this.currentRotateY, this.targetRotateY, this.skewSpeed);
            this.element.style.transform = 'perspective(' + this.perspective + 'px) rotateX(' + this.currentRotateX + 'deg) rotateY(' + this.currentRotateY + 'deg) scale3d(' + this.dynScale + ", " + this.dynScale + ", " + this.dynScale + ")";

            if (this.backgroundInterval != null) {
                if (Math.abs(this.currentRotateX) < 0.5 && Math.abs(this.currentRotateY) <= 0.5 && this.dynScale <= 1.01) {
                    clearInterval(this.backgroundInterval);
                    this.backgroundInterval = null;
                }
            } else if (!(Math.abs(this.currentRotateX) < 0.5 && Math.abs(this.currentRotateY) <= 0.5 && this.dynScale <= 1.01)) {
                this.backgroundInterval = setInterval(() => {
                    thisPtr.update();
                }, 10);
            }

            return null;
        } else if (this.skewInRange && this.isInRange) {
            if (this.backgroundInterval != null) {
                clearInterval(this.backgroundInterval);
                this.backgroundInterval = null;
            }
            this.update_card_properties();
            this.dynScale = lerp(this.dynScale, this.scaleInRange, this.skewSpeed);
        }
        this.currentRotateX = lerp(this.currentRotateX, this.targetRotateX, this.skewSpeed);
        this.currentRotateY = lerp(this.currentRotateY, this.targetRotateY, this.skewSpeed);
        this.element.style.transform = 'perspective(' + this.perspective + 'px) rotateX(' + this.currentRotateX + 'deg) rotateY(' + this.currentRotateY + 'deg) scale3d(' + this.dynScale + ", " + this.dynScale + ", " + this.dynScale + ")";
    }
}

let typeText = null;
const words = [
    "coding",
    "programming",
    "mathematics",
    "physics",
    "computing",
    "rust",
    "c++",
    "html",
    "css",
    "javascript",
    "lua",
    "anime",
    "manga",
    "webtoons",
    "my self",
    "you",
];
const typeDelay = 300;
const typeWaitEnd = 3000;
const typeWaitStart = 1000;
const typeBack = 100;

function setUpPfpProperties() {
    pfpWidth = pfp.offsetWidth;
    pfpHeight = pfp.offsetHeight;
    pfpWidthH = pfpWidth * 0.5;
    pfpHeightH = pfpHeight * 0.5;
    RcpPfpWidthH = 1 / pfpWidthH;
    RcpPfpHeightH = 1 / pfpHeightH;
}

function init_pfp_card() {
    const pfp_card = new CardSkew(document.getElementById("pfp"), 15, 0.1, 500, true, 1.1);

    const cards = document.getElementsByClassName("card");
    document.getElementById("cards").onmousemove = function (event) {
        if (isBodyHidden) {
            return null;
        }
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];

            const rect = card.getBoundingClientRect();
            const xDisplacement = event.clientX - rect.left;
            const yDisplacement = event.clientY - rect.top;

            card.style.setProperty("--mouse-x", xDisplacement + "px");
            card.style.setProperty("--mouse-y", yDisplacement + "px");
        }
    }

    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const card_skewer = new CardSkew(card, 10, 0.1, 500, true, 1.4, true);
    }
}

function word_erase(word, end_character) {
    end_character = end_character - 1;
    if (end_character >= 0) {

        typeText.innerHTML = word.substring(0, end_character);

        setTimeout(() => {
            word_erase(word, end_character);
        }, typeBack);
        return null;
    }
    setTimeout(() => {
        write_word(pickRandom(words), 1);
    }, typeWaitStart);
}

function write_word(word, end_character) {

    typeText.innerHTML = word.substring(0, end_character);

    if (end_character < word.length) {
        setTimeout(() => {
            write_word(word, end_character + 1);
        }, typeDelay);
        return null;
    }

    setTimeout(() => {
        word_erase(word, end_character);
    }, typeWaitEnd);
}

addEventListener('DOMContentLoaded', () => {
    console.log("init");
    if (!((/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))))) {
        console.log("desktop user detected; init card");
        init_pfp_card();
    } else {
        console.log("non-desktop user detected; card skip init");
    }
    typeText = document.getElementById("txt-like");
    write_word(pickRandom(words), 1);

    const helpertext = document.getElementById("helpertext");
    const mainbody = document.getElementsByClassName("mainbody")[0];
    const bodysection = document.getElementById("bodysection");
    document.onscroll = function (event) {
        const rect = mainbody.getBoundingClientRect();
        if (rect.top <= 0) {
            bodysection.className = "visiblebody";
            isBodyHidden = false;
            helpertext.className = "helpertext_play";
        } else {
            isBodyHidden = true;
            helpertext.className = "helpertext_end";
            bodysection.className = "hiddenbody";
        }
    }
});