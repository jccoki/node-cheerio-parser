#!/bin/bash

# 149 max
for i in `seq 1 149`; do
  wget \
     --post-data="searchType=Suburb&noRefine=&lawyerName=&distanceCalc=&searchWithin=10&list_state=NSW&list_state2=&lawyer_id=&txtSuburb=2000&search=true&pageNum=$i&searchType=Suburb&type=&typeRefine=&level=&lawarea=&lawareaRefine=&flashfile=&feature=&list_region=&list_subreg=&list_subreg2=&specialRefine=" \
    --header="Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8" \
    --header="Accept-Encoding:deflate, sdch" \
    --header="Accept-Language:en-US,en;q=0.8" \
    --header="Cache-Control:no-cache" \
    --header="Connection:keep-alive" \
    --header="Cookie: PHPSESSID=fb4a3d9b20b959fd806f47d023da2b68; _ga=GA1.3.1502957159.1461827441" \
    --header="Host: www.australianlawyersdirectory.com.au" \
    --header="Origin: http://www.australianlawyersdirectory.com.au" \
    --header="Pragma:no-cache" \
    --header="Upgrade-Insecure-Requests:1" \
    --header="User-Agent:Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36" \
    "http://www.australianlawyersdirectory.com.au/search-result.php" -O 2000.$i &

 for j in `seq 1 5000`; do
   echo;
 done;
done
