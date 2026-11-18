# Ruby tools for building the site on your own computer.
# Install them once with:  bundle install
source "https://rubygems.org"

# The same Jekyll and plugins that GitHub Pages uses, so your laptop builds what the live site shows
gem "github-pages", "~> 233", group: :jekyll_plugins

# Checks every link and image in the built site (used by the tests)
gem "html-proofer", "~> 5.0", group: :test

# Needed on Windows: time-zone data and a file watcher for `jekyll serve`
platforms :windows do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
  gem "wdm", "~> 0.1"
end
gem "faraday-retry"     # quiets a harmless message from one of the GitHub Pages plugins
gem "webrick", "~> 1.8"   # the small web server behind `jekyll serve` (Ruby 3 no longer includes it)
