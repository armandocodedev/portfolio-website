// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    // Load JSON data
    loadPortfolioData();
    
    // Smooth scrolling for navigation links
    initSmoothScrolling();
});

// Load portfolio data from JSON file
async function loadPortfolioData() {
    try {
        const response = await fetch('/data/data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update different sections with the loaded data
        updatePersonalInfo(data.personalInfo);
        updateNavigation(data.navigation);
        updateProjects(data.projects);
        updateSkills(data.skills);
        updateExperienceAndEducation(data.experience, data.education);
        updateTestimonials(data.testimonials);
        updateTheme(data.siteSettings.theme);
        updateCalendly(data.personalInfo.calendlyUsername);
        
    } catch (error) {
        console.error('Error loading portfolio data:', error);
    }
}

// Update personal information
function updatePersonalInfo(personalInfo) {
    // Update name in logo and footer
    document.querySelectorAll('.logo').forEach(element => {
        element.textContent = personalInfo.name;
    });
    
    // Update hero section
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const heroTitle = heroSection.querySelector('h1');
        const heroSubtitle = heroSection.querySelector('p');
        
        if (heroTitle) heroTitle.textContent = `Welcome to ${personalInfo.name}'s Portfolio`;
        if (heroSubtitle) heroSubtitle.textContent = personalInfo.title;
    }
    
    // Update about section
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        const aboutContent = aboutSection.querySelector('p');
        if (aboutContent) aboutContent.textContent = personalInfo.bio;
    }
    
    // Update footer
    const footer = document.querySelector('footer');
    if (footer) {
        const footerText = footer.querySelector('p');
        if (footerText) footerText.innerHTML = `&copy; ${new Date().getFullYear()} ${personalInfo.name}. All rights reserved.`;
    }
    
    // Add social links if they exist in the DOM
    if (personalInfo.socialLinks) {
        const socialContainer = document.querySelector('.social-links');
        if (socialContainer) {
            // Clear existing links
            socialContainer.innerHTML = '';
            
            // Add each social link
            for (const [platform, url] of Object.entries(personalInfo.socialLinks)) {
                if (url) {
                    const link = document.createElement('a');
                    link.href = url;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.classList.add('social-icon', platform);
                    link.setAttribute('aria-label', platform);
                    
                    // You can add icons here if you want
                    
                    socialContainer.appendChild(link);
                }
            }
        }
    }
}

// Update navigation menu
function updateNavigation(navItems) {
    const navList = document.querySelector('nav ul');
    if (navList && navItems && navItems.length) {
        // Clear existing items
        navList.innerHTML = '';
        
        // Add each navigation item
        navItems.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = item.url;
            a.textContent = item.text;
            li.appendChild(a);
            navList.appendChild(li);
        });
        
        // Re-initialize smooth scrolling
        initSmoothScrolling();
    }
}

// Update projects section
function updateProjects(projects) {
    const projectGrid = document.querySelector('.project-grid');
    if (projectGrid && projects && projects.length) {
        // Clear existing projects
        projectGrid.innerHTML = '';
        
        // Add each project
        projects.forEach(project => {
            const projectElement = document.createElement('div');
            projectElement.classList.add('project');
            
            let projectHTML = `
                <h3>${project.title}</h3>
                <p>${project.description}</p>
            `;
            
            // Add tags if they exist
            if (project.tags && project.tags.length) {
                projectHTML += '<div class="project-tags">';
                project.tags.forEach(tag => {
                    projectHTML += `<span class="tag">${tag}</span>`;
                });
                projectHTML += '</div>';
            }
            
            // Add links if they exist
            projectHTML += '<div class="project-links">';
            if (project.liveUrl) {
                projectHTML += `<a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer">View Live</a>`;
            }
            if (project.githubUrl) {
                projectHTML += `<a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer">View Code</a>`;
            }
            projectHTML += '</div>';
            
            projectElement.innerHTML = projectHTML;
            projectGrid.appendChild(projectElement);
        });
    }
}

// Update skills section
function updateSkills(skillsData) {
    const skillsSection = document.getElementById('skills');
    if (skillsSection && skillsData && skillsData.length) {
        // Replace skills list with categorized skills
        const skillsContainer = skillsSection.querySelector('.skills-list') || document.createElement('div');
        skillsContainer.className = 'skills-container';
        skillsContainer.innerHTML = '';
        
        skillsData.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.classList.add('skill-category');
            
            categoryElement.innerHTML = `
                <h3>${category.category}</h3>
                <ul class="skills-list">
                    ${category.items.map(skill => `<li>${skill}</li>`).join('')}
                </ul>
            `;
            
            skillsContainer.appendChild(categoryElement);
        });
        
        // Replace or append the skills container
        const existingContainer = skillsSection.querySelector('.skills-container');
        if (existingContainer) {
            existingContainer.replaceWith(skillsContainer);
        } else {
            const h2 = skillsSection.querySelector('h2');
            if (h2) {
                h2.after(skillsContainer);
            } else {
                skillsSection.appendChild(skillsContainer);
            }
        }
    }
}

// Update experience and education sections
function updateExperienceAndEducation(experience, education) {
    // Check if these sections already exist in the HTML
    // If not, we can create them
    
    // Update experience section if it exists
    const experienceSection = document.getElementById('experience');
    if (experienceSection && experience && experience.length) {
        const experienceContainer = document.createElement('div');
        experienceContainer.className = 'experience-container';
        
        experience.forEach(job => {
            const jobElement = document.createElement('div');
            jobElement.classList.add('experience-item');
            
            jobElement.innerHTML = `
                <h3>${job.position}</h3>
                <h4>${job.company}, ${job.location}</h4>
                <p class="period">${job.period}</p>
                <p>${job.description}</p>
            `;
            
            experienceContainer.appendChild(jobElement);
        });
        
        // Replace existing content or append
        const existingContainer = experienceSection.querySelector('.experience-container');
        if (existingContainer) {
            existingContainer.replaceWith(experienceContainer);
        } else {
            const h2 = experienceSection.querySelector('h2');
            if (h2) {
                h2.after(experienceContainer);
            } else {
                experienceSection.appendChild(experienceContainer);
            }
        }
    }
    
    // Update education section if it exists
    const educationSection = document.getElementById('education');
    if (educationSection && education && education.length) {
        const educationContainer = document.createElement('div');
        educationContainer.className = 'education-container';
        
        education.forEach(edu => {
            const eduElement = document.createElement('div');
            eduElement.classList.add('education-item');
            
            eduElement.innerHTML = `
                <h3>${edu.degree}</h3>
                <h4>${edu.institution}</h4>
                <p class="period">${edu.year}</p>
                <p>${edu.description}</p>
            `;
            
            educationContainer.appendChild(eduElement);
        });
        
        // Replace existing content or append
        const existingContainer = educationSection.querySelector('.education-container');
        if (existingContainer) {
            existingContainer.replaceWith(educationContainer);
        } else {
            const h2 = educationSection.querySelector('h2');
            if (h2) {
                h2.after(educationContainer);
            } else {
                educationSection.appendChild(educationContainer);
            }
        }
    }
}

// Update testimonials if section exists
function updateTestimonials(testimonials) {
    const testimonialSection = document.getElementById('testimonials');
    if (testimonialSection && testimonials && testimonials.length) {
        const testimonialContainer = document.createElement('div');
        testimonialContainer.className = 'testimonial-container';
        
        testimonials.forEach(testimonial => {
            const testimonialElement = document.createElement('div');
            testimonialElement.classList.add('testimonial');
            
            testimonialElement.innerHTML = `
                <blockquote>"${testimonial.text}"</blockquote>
                <cite>
                    <strong>${testimonial.author}</strong>
                    <span>${testimonial.position}</span>
                </cite>
            `;
            
            testimonialContainer.appendChild(testimonialElement);
        });
        
        const existingContainer = testimonialSection.querySelector('.testimonial-container');
        if (existingContainer) {
            existingContainer.replaceWith(testimonialContainer);
        } else {
            const h2 = testimonialSection.querySelector('h2');
            if (h2) {
                h2.after(testimonialContainer);
            } else {
                testimonialSection.appendChild(testimonialContainer);
            }
        }
    }
}

// Update theme colors
function updateTheme(theme) {
    // Create a style element
    const style = document.createElement('style');
    
    // Define CSS variables based on theme settings
    style.textContent = `
        :root {
            --primary-color: ${theme.primaryColor};
            --secondary-color: ${theme.secondaryColor};
            --accent-color: ${theme.accentColor};
            --text-color: ${theme.textColor};
            --light-bg-color: ${theme.lightBackgroundColor};
        }
    `;
    
    // Add the style element to the head
    document.head.appendChild(style);
}

// Initialize Calendly
function updateCalendly(username) {
    if (!username) return;
    
    const calendlyPlaceholder = document.querySelector('.calendly-placeholder');
    
    if (calendlyPlaceholder) {
        // Clear placeholder
        calendlyPlaceholder.innerHTML = '';
        
        // Add Calendly widget
        const calendlyScript = document.createElement('script');
        calendlyScript.src = 'https://assets.calendly.com/assets/external/widget.js';
        calendlyScript.async = true;
        document.head.appendChild(calendlyScript);
        
        const calendlyWidget = document.createElement('div');
        calendlyWidget.className = 'calendly-inline-widget';
        calendlyWidget.style.minWidth = '320px';
        calendlyWidget.style.height = '630px';
        calendlyWidget.setAttribute('data-url', `https://calendly.com/${username}`);
        calendlyPlaceholder.appendChild(calendlyWidget);
    }
}

// Initialize smooth scrolling
function initSmoothScrolling() {
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
}
