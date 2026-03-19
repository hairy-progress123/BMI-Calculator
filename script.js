document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('bmi-form');
    const resultContainer = document.getElementById('result-container');
    const bmiValueEl = document.getElementById('bmi-value');
    const bmiCategoryEl = document.getElementById('bmi-category');
    const scaleIndicator = document.getElementById('scale-indicator');
    const idealWeightEl = document.getElementById('ideal-weight');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get inputs
        const heightCm = parseFloat(document.getElementById('height').value);
        const weightKg = parseFloat(document.getElementById('weight').value);
        
        // Basic validation
        if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
            alert('Please enter valid height and weight.');
            return;
        }

        // Calculate BMI
        const heightM = heightCm / 100;
        const bmi = weightKg / (heightM * heightM);
        const formattedBmi = bmi.toFixed(1);

        // Determine Category and Color
        let category = '';
        let colorClass = '';
        let indicatorPosition = 0; // percentage

        // Scale maps roughly: 0 -> 10, 100 -> 40 to match our flex segments somewhat
        // Flex segments: 18.5, 6.4, 5, 10 (Total: 39.9)
        // Underweight (0-18.5): 0 to 46% width
        // Normal (18.5-24.9): 46% to 62% width
        // Overweight (25-29.9): 62% to 75% width
        // Obese (30+): 75% to 100% width

        if (bmi < 18.5) {
            category = 'Underweight';
            colorClass = 'text-underweight';
            // Map BMI 10-18.5 to 0-46%
            indicatorPosition = Math.max(0, (bmi - 10) / 8.5) * 46;
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Normal Weight';
            colorClass = 'text-normal';
            // Map 18.5-25 to 46-62%
            indicatorPosition = 46 + ((bmi - 18.5) / 6.5) * 16;
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Overweight';
            colorClass = 'text-overweight';
            // Map 25-30 to 62-75%
            indicatorPosition = 62 + ((bmi - 25) / 5) * 13;
        } else {
            category = 'Obese';
            colorClass = 'text-obese';
            // Map 30-40 to 75-100%
            indicatorPosition = Math.min(100, 75 + ((bmi - 30) / 10) * 25);
        }

        // Calculate ideal weight range (BMI 18.5 to 24.9)
        const minIdealWeight = (18.5 * heightM * heightM).toFixed(1);
        const maxIdealWeight = (24.9 * heightM * heightM).toFixed(1);

        // Update UI
        resultContainer.classList.remove('hidden');
        
        // Clean up previous classes
        bmiValueEl.className = '';
        bmiCategoryEl.className = '';

        // Animate counting up (simple version)
        animateValue(bmiValueEl, 0, parseFloat(formattedBmi), 800);
        
        setTimeout(() => {
            bmiValueEl.classList.add(colorClass);
            bmiCategoryEl.textContent = category;
            bmiCategoryEl.classList.add(colorClass);
            scaleIndicator.style.left = `${indicatorPosition}%`;
            scaleIndicator.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue(`--c-${category.split(' ')[0].toLowerCase()}`).trim() || 'var(--text-primary)';
            
            idealWeightEl.innerHTML = `Ideal weight for your height: <strong>${minIdealWeight} kg - ${maxIdealWeight} kg</strong>`;
        }, 100); // small delay to ensure rendering
    });

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = start + easeProgress * (end - start);
            obj.innerHTML = currentVal.toFixed(1);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end.toFixed(1);
            }
        };
        window.requestAnimationFrame(step);
    }
});
