document.addEventListener("DOMContentLoaded", () => {
    class MultiStep {
        constructor(formId) {
            var myForm = document.querySelector(formId),
                steps = document.querySelectorAll(".steps"),
                btnsPrev = document.querySelectorAll(".btnPrev"),
                btnsNext = document.querySelectorAll(".btnNext"),
                indicators = document.querySelectorAll(".stepsdes"),
                btnPrev = btnsPrev[0],
                btnNext = btnsNext[0],
                inputClasses = ".obl",

                currentTab = 0;

            // we'll need 4 different functions to do this
            showTab(currentTab);

            function showTab(n) {
                steps[n].classList.add("active");
                console.log(n)
                if (n == 0) {
                    btnsPrev[n].classList.add("hidden");
                    btnsPrev[n].classList.remove("show");
                } else {
                    btnsPrev[n].classList.add("show");
                    btnsPrev[n].classList.remove("hidden");
                }
                if (n == steps.length - 1) {
                    btnsNext[n].textContent = "Submit";
                } else {
                    btnsNext[n].textContent = "Next";
                }
                showIndicators(n);
            }

            function showIndicators(n) {
                for (let i = 0; i < indicators.length; i++) {
                    indicators[i].classList.replace("bg-warning", "bg-success");
                }
                indicators[n].className += " bg-warning";
            }

            function clickerBtn(n) {
                if (n == 1 && !validateForm()) return false;
                steps[currentTab].classList.remove("active");
                currentTab = currentTab + n;
                if (currentTab >= steps.length) {
                    myForm.submit();
                    return false;
                }
                console.log(currentTab)
                showTab(currentTab);
            }
            // Do whatever validation you want
            function validateForm() {
                let input = steps[currentTab].querySelectorAll(inputClasses),
                    valid = true;
                for (let i = 0; i < input.length; i++) {
                    if (input[i].value == "") {
                        if (!input[i].classList.contains("invalid")) {
                            input[i].classList.add("invalid");
                        }
                        valid = false;
                    }
                    if (!input[i].value == "") {
                        if (input[i].classList.contains("invalid")) {
                            input[i].classList.remove("invalid");
                        }
                    }
                }
                return valid;
            }
            btnsPrev.forEach((btnPrev) =>{
            btnPrev.addEventListener("click", () => {
                clickerBtn(-1);
            })
        });
            btnsNext.forEach((btnNext) =>{

            btnNext.addEventListener("click", () => {
                clickerBtn(1);
            })});
        }
    }
    let MS = new MultiStep("#stepped"); let MS1 = new MultiStep("#stepped1");
});
