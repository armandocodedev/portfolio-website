// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    initThemeToggle();

    // Load JSON data
    if (document.querySelector('[data-portfolio-page]') || document.querySelector('.project-grid')) {
        loadPortfolioData();
    }
    
    // Smooth scrolling for navigation links
    initSmoothScrolling();
});

// Load portfolio data from JSON file
async function loadPortfolioData() {
    try {
        const response = await fetch('data/data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update different sections with the loaded data
        updatePersonalInfo(data.personalInfo);
        updateNavigation(data.navigation);
        updateFocusAreas(data.focusAreas);
        updateProjects(data.projects);
        updateSkills(data.skills);
        updateExperienceAndEducation(data.experience, data.education);
        updateTestimonials(data.testimonials);
        updateTheme(data.siteSettings.theme);
        updateMetaTags(data.siteSettings.metaTags);
        loadResumeData();
        
    } catch (error) {
        console.error('Error loading portfolio data:', error);
    }
}

async function loadResumeData() {
    const resumePanel = document.querySelector('.resume-panel');
    if (!resumePanel) return;

    try {
        const response = await fetch('data/resume.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const resume = await response.json();
        updateResumePanel(resume);
    } catch (error) {
        console.error('Error loading resume data:', error);
    }
}

function updateResumePanel(resume) {
    const resumePanel = document.querySelector('.resume-panel');
    if (!resumePanel || !resume) return;

    const headlineSkills = (resume.headlineSkills || [])
        .map(skill => `<li>${skill}</li>`)
        .join('');

    const techStack = (resume.techStack || [])
        .map(group => `
            <article class="resume-stack-card">
                <h3>${group.category}</h3>
                <ul>
                    ${(group.items || []).map(item => `<li>${item}</li>`).join('')}
                </ul>
            </article>
        `)
        .join('');

    const recentRole = resume.work && resume.work.length ? resume.work[0] : null;
    const recentHighlights = recentRole ? `
        <div class="resume-current-role">
            <p class="resume-label">Current focus</p>
            <h3>${recentRole.position} - ${recentRole.company}</h3>
            <ul>
                ${(recentRole.highlights || []).slice(0, 3).map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
    ` : '';

    resumePanel.innerHTML = `
        <div class="resume-summary">
            <p>${resume.basics.summary}</p>
            <div class="core-stack">
                <p class="resume-label">Core stack</p>
                <ul>${headlineSkills}</ul>
            </div>
            <a class="resume-json-link" href="data/resume.json" target="_blank" rel="noopener noreferrer">View JSON CV</a>
        </div>
        ${recentHighlights}
        <div class="resume-stack-grid">
            ${techStack}
        </div>
    `;
}

// Initialize light/dark theme preference
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const savedTheme = localStorage.getItem('portfolio-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    applyColorMode(initialTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('portfolio-theme', nextTheme);
            applyColorMode(nextTheme);
        });
    }
}

function applyColorMode(theme) {
    const normalizedTheme = theme === 'dark' ? 'dark' : 'light';
    const themeToggle = document.querySelector('.theme-toggle');

    document.documentElement.dataset.theme = normalizedTheme;

    if (themeToggle) {
        const isDark = normalizedTheme === 'dark';
        themeToggle.textContent = isDark ? 'Light' : 'Dark';
        themeToggle.setAttribute('aria-pressed', String(isDark));
        themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    }
}

// Update browser title and SEO metadata
function updateMetaTags(metaTags) {
    if (!metaTags) return;

    if (metaTags.title) {
        document.title = metaTags.title;
    }

    const metaMap = {
        description: metaTags.description,
        keywords: metaTags.keywords
    };

    Object.entries(metaMap).forEach(([name, content]) => {
        if (!content) return;

        let element = document.querySelector(`meta[name="${name}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute('name', name);
            document.head.appendChild(element);
        }

        element.setAttribute('content', content);
    });
}

// Update personal information
function updatePersonalInfo(personalInfo) {
    // Update brand label and footer identity.
    document.querySelectorAll('.logo').forEach(element => {
        const brandName = personalInfo.brandName || personalInfo.name;
        element.setAttribute('aria-label', `${brandName} home`);

        const brandNameElement = element.querySelector('.brand-name');
        if (brandNameElement) {
            brandNameElement.textContent = brandName;
        } else {
            element.textContent = brandName;
        }
    });
    
    // Update hero section
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const heroTitle = heroSection.querySelector('h1');
        const heroSubtitle = heroSection.querySelector('p');
        
        if (heroTitle) heroTitle.textContent = personalInfo.heroHeadline || `${personalInfo.name} Portfolio`;
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
        if (footerText) footerText.textContent = `\u00a9 ${new Date().getFullYear()} ${personalInfo.name}. All rights reserved.`;
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
                    link.innerHTML = `
                        ${getSocialIcon(platform)}
                        <span>${getSocialLabel(platform)}</span>
                    `;
                    
                    socialContainer.appendChild(link);
                }
            }
        }
    }
}

function getSocialIcon(platform) {
    const icons = {
        email: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 3.2V17h16V8.2l-7.38 5.16a1 1 0 0 1-1.14 0L4 8.2Zm1.7-1.2L12 11.4 18.3 7H5.7Z"/></svg>',
        github: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 .5a12 12 0 0 0-3.8 23.39c.6.11.82-.26.82-.58v-2.15c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.45 11.45 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.82 1.1.82 2.22v3.3c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z"/></svg>',
        linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11.5H3V9.75Zm6.25 0h3.83v1.57h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1v5.89h-4v-5.22c0-1.25-.02-2.85-1.74-2.85-1.74 0-2.01 1.36-2.01 2.76v5.31h-4V9.75Z"/></svg>',
        external: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14 3h7v7h-2V6.41l-8.29 8.3-1.42-1.42 8.3-8.29H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"/></svg>'
    };

    return icons[platform] || '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 14h-2v-4H8l4-5 4 5h-3v4Z"/></svg>';
}

function getSocialLabel(platform) {
    const labels = {
        email: 'Email',
        github: 'GitHub',
        linkedin: 'LinkedIn'
    };

    return labels[platform] || platform;
}

// Update AI QA Lab focus areas
function updateFocusAreas(focusAreas) {
    const focusGrid = document.querySelector('.focus-grid');
    if (!focusGrid || !focusAreas || !focusAreas.length) return;

    focusGrid.innerHTML = '';

    focusAreas.forEach(area => {
        const areaElement = document.createElement('article');
        areaElement.classList.add('focus-card');

        areaElement.innerHTML = `
            <h3>${area.title}</h3>
            <p>${area.description}</p>
            <div class="project-tags">
                ${(area.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        `;

        focusGrid.appendChild(areaElement);
    });
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

            if (project.outcomes && project.outcomes.length) {
                projectHTML += '<ul class="project-outcomes">';
                project.outcomes.forEach(outcome => {
                    projectHTML += `<li>${outcome}</li>`;
                });
                projectHTML += '</ul>';
            }
            
            // Add links if they exist
            projectHTML += '<div class="project-links">';
            if (project.liveUrl) {
                projectHTML += `<a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer">${getSocialIcon('external')}<span>Open Live Result</span></a>`;
            }
            if (project.githubUrl && project.showCodeLink) {
                projectHTML += `<a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer">${getSocialIcon('github')}<span>View Code</span></a>`;
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
        const skillsContainer = skillsSection.querySelector('.skills-list') || document.createElement('div');
        skillsContainer.className = 'skills-container';
        skillsContainer.innerHTML = '';
        
        skillsData.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.classList.add('skill-category');
            
            categoryElement.innerHTML = `
                <h3>${category.category}</h3>
                <ul class="skill-list">
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

// Initialize smooth scrolling
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Get the target section id from the href
            const targetId = this.getAttribute('href');
            if (!targetId || !targetId.startsWith('#')) return;

            // Prevent default anchor click behavior
            e.preventDefault();
            
            // Scroll to the target section smoothly
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}
