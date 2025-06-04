import { Client, Databases, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client().setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT).setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.equal("searchTerm", searchTerm)]);

    if (result.documents.length > 0) {
      const doc = result.documents[0];
      await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1,
      });
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm: searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error("Error updating search count:", error);
  }
};

export const getTrendingMovies = async () => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(5)]);

    const movieAggregates = new Map();

    result.documents.forEach((doc) => {
      if (!movieAggregates.has(doc.movie_id)) {
        movieAggregates.set(doc.movie_id, {
          movie_id: doc.movie_id,
          count: 0,
          poster_url: doc.poster_url,
          searchTerm: doc.searchTerm,
        });
      }

      const aggregate = movieAggregates.get(doc.movie_id);
      aggregate.count += doc.count;

      if (doc.count > aggregate.maxCount) {
        aggregate.searchTerm = doc.searchTerm;
        aggregate.maxCount = doc.count;
      }
    });

    const trendingMovies = Array.from(movieAggregates.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    console.log("Trending Movies:", trendingMovies);
    return trendingMovies;
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
};
