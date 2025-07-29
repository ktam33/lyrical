## Description
This is a web app that translates Cantonese song lyrics. 
1. Given a set of song lyrics, it sends those lyrics to a OpenAI gpt model to get a translation. This translation should favor translating in a way that captures the meaning of the overall song rather than a literal translation. 
1. It will output the translation to the screen. It will interleave the original Chinese line with the translated line. 
1. The application has a list of Chinese characters in a database represented by the Cantonese.txt text file
    - The first two lines are headers
    - The remaining lines has a character followed by a definition
1.  The application will then go through each character of the provided lyrics and compare against the set of characters in the database. 
1. For each new character, generate new line that can be inserted into the database. Do not actually insert the line.
    - If the word has multiple meanings, choose the meaning that best aligns with the song
    - The way that this should work is that after generating the list of all new characters, issue an LLM call to generate the new lines. 
1. Output the set of new lines to the screen. 