# Komiku API

A Node.js API for fetching manga data from Komiku.id.

## Features

- Search manga by title
- Get manga details and chapter list
- Get chapter details and images
- Get manga recommendations
- Get popular manga by category (manga, manhwa, manhua)

## API Endpoints

### Search Manga
```
GET /search?query={search_term}
```

### Get Manga Details
```
GET /manga?url={manga_url}
```

### Get Chapter Details
```
GET /chapter?url={chapter_url}
```

### Get Recommendations
```
GET /recommendations
```

### Get Popular Manga
```
GET /popular?category={category}&page={page}
```
- `category`: manga, manhwa, manhua (default: manga)
- `page`: page number (default: 1)