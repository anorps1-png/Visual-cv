import urllib.request
import re
import json
import sqlite3
import uuid
from datetime import datetime
import os

def clean_html(raw_html):
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    # Replace common HTML entities
    cleantext = cleantext.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&eacute;', 'é').replace('&egrave;', 'è').replace('&agrave;', 'à').replace('&ugrave;', 'ù').replace('&ocirc;', 'ô').replace('&icirc;', 'î').replace('&euml;', 'ë').replace('&ccedil;', 'ç').replace('&quot;', '"').replace('&apos;', "'").replace('&#39;', "'").replace('&rsquo;', "'")
    # Clean up whitespace
    cleantext = re.sub(r'\s+', ' ', cleantext)
    return cleantext.strip()

def scrape_jobs():
    print("Scraping main job list page...")
    list_url = "http://cameroun.minajobs.net/offres-emplois-stages"
    headers = {'User-Agent': 'Mozilla/5.0'}
    req = urllib.request.Request(list_url, headers=headers)
    
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print("Failed to fetch list page:", e)
        return []
    
    # Extract links like /emplois-stage-recrutement/ID/title
    links = re.findall(r'href="([^"]+)"', html)
    job_links = list(set([l for l in links if '/emplois-stage-recrutement/' in l and len(l.split('/')) > 3]))
    
    print(f"Found {len(job_links)} job URLs on the page.")
    
    jobs = []
    # Scrape first 8 jobs
    for link in job_links[:8]:
        if not link.startswith('http'):
            full_url = "http://cameroun.minajobs.net" + link
        else:
            full_url = link
        
        print(f"Scraping job detail from: {full_url}")
        detail_req = urllib.request.Request(full_url, headers=headers)
        
        try:
            with urllib.request.urlopen(detail_req) as response:
                detail_html = response.read().decode('utf-8', errors='ignore')
        except Exception as e:
            print(f"Failed to fetch job detail from {full_url}:", e)
            continue
            
        # Parse detail container <div class="detail-font" > ... </div>
        detail_match = re.search(r'<div class="detail-font"\s*>(.*?)</div>', detail_html, re.DOTALL)
        if not detail_match:
            # Fallback search without class quotes or extra spaces
            detail_match = re.search(r'<div class="detail-font"[^>]*>(.*?)</div>', detail_html, re.DOTALL)
            
        if detail_match:
            detail_content = detail_match.group(1)
            
            # Extract title from h1
            title_match = re.search(r'<h1>(.*?)</h1>', detail_content, re.DOTALL)
            if title_match:
                title = clean_html(title_match.group(1))
            else:
                title = "Offre d'emploi"
                
            # Clean description
            description = clean_html(detail_content)
            # Remove title from description if it starts with it
            if description.startswith(title):
                description = description[len(title):].strip()
                
            # Extract company from title (usually: "Title at COMPANY")
            company = "Entreprise anonyme"
            if " at " in title:
                parts = title.split(" at ")
                title_clean = parts[0].strip()
                company = parts[1].strip()
            elif " chez " in title:
                parts = title.split(" chez ")
                title_clean = parts[0].strip()
                company = parts[1].strip()
            else:
                title_clean = title
                
            # Try to identify location from description or title
            location = "Cameroun"
            if "Douala" in description or "Douala" in title:
                location = "Douala, Cameroun"
            elif "Yaoundé" in description or "Yaoundé" in title or "Yaounde" in description:
                location = "Yaoundé, Cameroun"
            elif "Garoua" in description:
                location = "Garoua, Cameroun"
            elif "Maroua" in description:
                location = "Maroua, Cameroun"
                
            jobs.append({
                "id": str(uuid.uuid4()),
                "title": title_clean,
                "company": company,
                "location": location,
                "description": description,
                "sourceUrl": full_url,
                "createdAt": datetime.utcnow().isoformat() + "Z"
            })
            print(f"Successfully scraped: {title_clean} at {company}")
        else:
            print(f"Could not find detail-font div for {full_url}")
            
    return jobs

def save_to_db_and_json(jobs):
    if not jobs:
        print("No jobs to save.")
        return
        
    # Save to JSON
    data_dir = os.path.join("src", "lib", "data")
    os.makedirs(data_dir, exist_ok=True)
    json_path = os.path.join(data_dir, "jobs.json")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(jobs, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(jobs)} jobs to JSON at {json_path}")
    
    # Save to SQLite
    db_path = "dev.db"
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Clear existing jobs to populate fresh ones
        cursor.execute("DELETE FROM Job;")
        
        for job in jobs:
            cursor.execute(
                "INSERT INTO Job (id, title, company, location, description, sourceUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?);",
                (job["id"], job["title"], job["company"], job["location"], job["description"], job["sourceUrl"], job["createdAt"])
            )
            
        conn.commit()
        print(f"Saved {len(jobs)} jobs to SQLite dev.db")
        conn.close()
    except Exception as e:
        print("Database error:", e)

if __name__ == "__main__":
    jobs = scrape_jobs()
    save_to_db_and_json(jobs)
