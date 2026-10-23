import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Search, Clock, User, BookOpen } from "lucide-react";

export default function Articles() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  const { data: articles = [] } = useQuery({
    queryKey: ["/api/articles"],
    queryFn: () => fetch("/api/articles").then(res => res.json()),
  });

  const categories: string[] = Array.from(
  new Set<string>(
    articles.map((article: any) => String(article.category))
  )
);

  const filteredArticles = articles.filter((article: any) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Preventive Care": "bg-blue-100 text-blue-800",
      "Nutrition": "bg-green-100 text-green-800",
      "Fitness": "bg-purple-100 text-purple-800",
      "Mental Health": "bg-indigo-100 text-indigo-800",
      "Women's Health": "bg-pink-100 text-pink-800",
      "Men's Health": "bg-cyan-100 text-cyan-800",
      "Senior Health": "bg-orange-100 text-orange-800",
    };
    return colors[category] || "bg-slate-100 text-slate-800";
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Health Articles</h1>
          <p className="text-slate-600">Stay informed with the latest health tips and medical insights</p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category: string) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Featured Article */}
        {filteredArticles.length > 0 && (
          <Card className="mb-8 overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3">
                <img 
                  src={filteredArticles[0].imageUrl}
                  alt={filteredArticles[0].title}
                  className="w-full h-48 md:h-full object-cover"
                />
              </div>
              <div className="md:w-2/3 p-6">
                <Badge className={getCategoryColor(filteredArticles[0].category)}>
                  Featured • {filteredArticles[0].category}
                </Badge>
                <h2 className="text-2xl font-bold text-slate-900 mt-3 mb-3">
                  {filteredArticles[0].title}
                </h2>
                <p className="text-slate-600 mb-4">{filteredArticles[0].excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <div className="flex items-center">
                      <User className="mr-1 h-4 w-4" />
                      {filteredArticles[0].author}
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {filteredArticles[0].readTime}
                    </div>
                    <span>{new Date(filteredArticles[0].publishedAt).toLocaleDateString()}</span>
                  </div>
                  <Button onClick={() => setSelectedArticle(filteredArticles[0])}>
                      Read Article
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Articles Found</h3>
              <p className="text-slate-600">Try adjusting your search or filter criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.slice(1).map((article: any) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video">
                  <img 
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <Badge className={getCategoryColor(article.category)}>
                    {article.category}
                  </Badge>
                  <h3 className="font-semibold text-slate-900 mt-3 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                    <div className="flex items-center">
                      <User className="mr-1 h-3 w-3" />
                      {article.author}
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {article.readTime}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                    <Button
                         variant="outline"
                         size="sm"
                         onClick={() => setSelectedArticle(article)}
                        >
                         Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredArticles.length > 9 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Articles
            </Button>
          </div>
        )}
      </div>
      
{selectedArticle && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">
          {selectedArticle.title}
        </h2>
        <Button
          variant="outline"
          onClick={() => setSelectedArticle(null)}
        >
          Close
        </Button>
      </div>

      {selectedArticle.imageUrl && (
        <img
          src={selectedArticle.imageUrl}
          alt={selectedArticle.title}
          className="mb-4 max-h-72 w-full rounded-lg object-cover"
        />
      )}

      <p className="mb-4 text-sm text-slate-500">
        {selectedArticle.category} · {selectedArticle.author} · {selectedArticle.readTime}
      </p>

      <p className="whitespace-pre-line leading-7 text-slate-700">
        {selectedArticle.content}
      </p>
    </div>
  </div>
)}

    </div>
  );
}
