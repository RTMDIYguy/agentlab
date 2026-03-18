import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LiveChat } from "./components/LiveChat";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import ArticleEditor from "./pages/ArticleEditor";
import BlogManager from "./pages/BlogManager";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import HelpCenter from "./pages/HelpCenter";
import Status from "./pages/Status";
import NewsletterVerify from "./pages/NewsletterVerify";
import NewsletterUnsubscribe from "./pages/NewsletterUnsubscribe";
import NewsletterManager from "./pages/NewsletterManager";
import Services from "./pages/Services";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/services"} component={Services} />
      <Route path={"/about"} component={About} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:id"} component={BlogArticle} />
      <Route path={"/article/new"} component={ArticleEditor} />
      <Route path={"/article/:slug"} component={ArticleEditor} />
      <Route path={"/blog-manager"} component={BlogManager} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/dashboard/settings"} component={Settings} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/terms"} component={Terms} />
      <Route path={"/cookies"} component={Cookies} />
      <Route path="/help" component={HelpCenter} />
      <Route path="/status" component={Status} />
      <Route path="/newsletter/verify" component={NewsletterVerify} />
      <Route path="/newsletter/unsubscribe" component={NewsletterUnsubscribe} />
      <Route path="/newsletter-manager" component={NewsletterManager} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <LiveChat />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
