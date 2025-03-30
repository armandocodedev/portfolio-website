// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Prevent default anchor click behavior
            e.preventDefault();
            
            // Get the target section id from the href
            const targetId = this.getAttribute('href');
            
            // Scroll to the target section smoothly
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Add Calendly integration
    // This is a placeholder for when you're ready to integrate Calendly
    const calendlyPlaceholder = document.querySelector('.calendly-placeholder');
    
    if (calendlyPlaceholder) {
        // Uncomment and modify this when you're ready to integrate Calendly
        /*
        calendlyPlaceholder.innerHTML = '';
        const calendlyScript = document.createElement('script');
        calendlyScript.src = 'https://assets.calendly.com/assets/external/widget.js';
        calendlyScript.async = true;
        document.head.appendChild(calendlyScript);
        
        const calendlyWidget = document.createElement('div');
        calendlyWidget.className = 'calendly-inline-widget';
        calendlyWidget.style.minWidth = '320px';
        calendlyWidget.style.height = '630px';
        calendlyWidget.setAttribute('data-url', 'https://calendly.com/your-username');
        calendlyPlaceholder.appendChild(calendlyWidget);
        */
    }
    
    // Add any other dynamic functionality here
});
