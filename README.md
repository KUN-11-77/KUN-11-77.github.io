# Kunhong Song — Academic Homepage

Personal academic website for Kunhong Song, Zhejiang University.

**Live site:** https://kun-11-77.github.io/

## Pages

- `index.html`: short biography, research overview, current work, contact links, and a brief recognition note.
- `about.html`: full academic profile.
- `assets/academic/`: shared styles, a small copyright-year helper, and the supplied Intel Cup logo.

The website is plain HTML, CSS, and JavaScript. It needs no package installation or build step, and the core pages work without JavaScript or third-party services. Fonts use the reader's system serif and sans-serif families.

## Editing

Update personal content directly in the two HTML files. Theme colors and responsive styles live in `assets/academic/style.css`. Add an authorized portrait when one is available. Add a CV or publication links only once the actual documents are ready; the current version does not invent them.

The profile and research description were supplied by the site owner. The Intel Cup title follows the supplied contest logo: **Intel Cup Embedded System Design Contest**. No biography was imported from the old website.

## Preview and publication

Serve this directory with any local static server, then open `index.html`. The `.github/workflows/deploy.yml` publishes pushes to `main` through GitHub Pages. It stages only the two pages and `assets/academic/` into `_site`, avoiding the legacy resource archive.

The previous site is retained in Git history under `before-academic-redesign-20260912`. Earlier notes and assets are retained in the repository but are not part of the published academic site.

## Design references

The content hierarchy draws on academic personal websites, with a plain white page, dark text, small burgundy links, and standard academic text entries:

- David Bindel, Cornell: https://www.cs.cornell.edu/~bindel/
- Prateek Mittal, Princeton: https://www.princeton.edu/~pmittal/
- Jon Kleinberg, Cornell: https://www.cs.cornell.edu/home/kleinber/

Official institutional naming references:

- Zhejiang University, College of Information Science and Electronic Engineering: https://www.zju.edu.cn/english/2018/0523/c20093a813214/page.htm
- Chu Kochen Honors College: https://ckc.zju.edu.cn/ckcen/

Visual inspiration does not imply an affiliation with the reference universities.