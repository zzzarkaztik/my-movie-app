import { Client, Databases, ID, Query } from "appwrite";
import { appwriteConfig } from "./config";

const client = new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
  try {
    const result = await database.listDocuments(appwriteConfig.databaseId, appwriteConfig.collectionId, [
      Query.equal("searchTerm", searchTerm),
    ]);

    if (result.documents.length > 0) {
      const doc = result.documents[0];
      await database.updateDocument(appwriteConfig.databaseId, appwriteConfig.collectionId, doc.$id, { count: doc.count + 1 });
    } else {
      await database.createDocument(appwriteConfig.databaseId, appwriteConfig.collectionId, ID.unique(), {
        searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error("Error updating search count:", error);
    throw error;
  }
};

export const getTrendingMovies = async () => {
  try {
    const result = await database.listDocuments(appwriteConfig.databaseId, appwriteConfig.collectionId, [
      Query.limit(10000),
      Query.orderDesc("count"),
    ]);

    const movieAggregates = new Map();

    result.documents.forEach((doc) => {
      const movieId = doc.movie_id;

      if (!movieAggregates.has(movieId)) {
        movieAggregates.set(movieId, {
          movie_id: movieId,
          totalCount: 0,
          poster_url: doc.poster_url,
          latestSearchTerm: doc.searchTerm,
          highestSingleCount: doc.count,
        });
      }

      const aggregate = movieAggregates.get(movieId);
      aggregate.totalCount += doc.count;

      if (doc.count > aggregate.highestSingleCount) {
        aggregate.latestSearchTerm = doc.searchTerm;
        aggregate.highestSingleCount = doc.count;
      }
    });

    const trendingMovies = Array.from(movieAggregates.values())
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, 5);

    return trendingMovies;
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
};
