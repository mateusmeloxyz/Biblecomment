import re, json, time, requests, os
from requests.api import options
from selenium.webdriver import Chrome, ChromeOptions
from selenium.webdriver.support.ui import WebDriverWait

token = "YOUR TOKEN HERE"
API_URL = "https://www.abibliadigital.com.br/api"

class PageLoaded(object):
    def __init__(self, oldId):
        self.oldId = oldId

    def __call__(self, browser):
        return self.oldId != browser.find_element_by_tag_name("html").id


def waitToLoad(browser, oldId):
    '''
    Wait the webpage load by tag_name.id
    '''
    try:
        wait = WebDriverWait(browser, 10)
        wait.until(PageLoaded(oldId))
        return True
    except Exception as e:
        print(e)
        return False

def versesTotal(abbrev, chapter, token):
    '''
    Return the total of verses of a chapter requesting bibleapi
    '''
    response = requests.get(
        f"{API_URL}/verses/ra/{abbrev}/{str(chapter)}", 
        headers = {"Authorization": "Bearer " + token},
    )
    result = response.json()
    return result["chapter"]["verses"]

book_list = []

opcoes = ChromeOptions()
opcoes.binary_location = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
browser = Chrome("./chromedriver.exe", options = opcoes)

for abbrev in book_list:
    error = False

    chapter = 1
    totalChapters = requests.get(
            f"{API_URL}/books/{abbrev}/", 
            headers = {"Authorization": "Bearer " + token},
        ).json()["chapters"]
    book = {}

    while chapter <= totalChapters and not error:
        print(f"Capturing the chapter {chapter} with ", end = "")
        # It enter in the chapter and wait to load

        oldId = browser.find_element_by_tag_name("html").id
        browser.get(f"https://pesquisa.biblia.com.br/pt-BR/RA/{abbrev}/{str(chapter)}")
        error = not waitToLoad(browser, oldId)
        
        if error:
            print("Script interrupted")
            continue

        # It scroll to the end for load full page
        browser.execute_script("window.scrollBy(0, document.body.scrollHeight)")
        time.sleep(0.6)

        # It capture the verses
        total = versesTotal(abbrev, chapter, token)
        verses = browser.find_elements_by_css_selector("li[class=versiculoTexto]")
        cont = 0
        while len(verses) != total and cont < 20:
            browser.execute_script("window.scrollBy(0, document.body.scrollHeight)")
            time.sleep(0.6)
            verses = browser.find_elements_by_css_selector("li[class=versiculoTexto]")
            cont += 1

        # It create a new dictionary of the chapter
        book[chapter] = []
        for verse in verses:
            # It split the verse number of the verse text
            verse_number, verse_text = [x for x in re.split(r'(\d+)\s+([\w\W]*)', verse.text) if x != ""]
            book[chapter].append(verse_text.strip())
        print(len(book[chapter]), "verses")

        chapter += 1

    if not error:
        print("Creating File")
        with open(os.path.join("chapters", f"{abbrev}.json"), "w", 
            encoding="utf-8") as file:
            json.dump(book, file, ensure_ascii=False, indent = 2)

        # Add the chapters number in the books.json
        # with open("books.json", encoding="utf-8") as file:
        #     books = json.load(file)
        # with open("books.json", "w", encoding="utf-8") as file:
        #     books.update({abbrev: totalChapters})
        #     json.dump(books, file, ensure_ascii=False, indent = 2)
        print("Files created!")

browser.quit()