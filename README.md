**[JMC](http://jindo.dev.naver.com/docs/jindo-mobile/archive/latest/doc/external/index.html) - Jindo Mobile Component**
=========================================

## **What is JMC?**
JMC is a framework that make easier to develop mobile web UI. JMC provide UI components like scroll, flicking, etc.. 

JMC is the main JavaScript Mobile Component used for developing most of NAVER's web products.

> **JMC is a part of JindoJS family product**

> JindoJS consists with : `Jindo, Jindo Component and Jindo Mobile Component`

> - __Official website__ : http://jindo.dev.naver.com/jindo_home/Mobile.html
> - __Online API Documentation__ : http://jindo.dev.naver.com/docs/jindo-mobile/archive/latest/doc/external


### **JMC Features**
- Support cross platform and browsing in mobile environment
- Provide fast loading speed and optimal performance
- It makes to manage separately presentational markup and logic programming code
- Components can be extended through a custom event


## **How to install?**
```bash
bower install jindojs-jmc
```

- **Manual download** :  
 - JMC provide online download page. You can customize download by choosing components which will be utilized.
 - http://jindo.dev.naver.com/utils/downloader/selection/?target=jindo_mobile


## **Modules**
- The below list are modules that are used frequently.
 - For complete list and it's API, please visit :
 - http://jindo.nhncorp.com/docs/jindo-mobile/archive/latest/doc/internal/index.html

- **m**: Basic name space of Jindo Mobile Component, as well as being a static object.
- **m.*Flicking**: Component that shows multiple contents areas by various effects(XXX) left/right, up/down through user’s touch movements.
- **m.Scroll**: Component that can be scrolled by touching inside the page’s fixed area
- **m.IndexScroll**: Component that can touch inside the page’s fixed area and scroll, and also has an index display function and scroll bar.
- **m.FloatingLayer**: Component where a layer is floating in a specific position on the screen, even if a scroll is activated.
- **m.MoreContentButton**: Component that dynamically adds the number of lists that are designated when clicking the View More button.
- **m.PageNavigation**: Component that expresses multiple items in a page format
- **m.ScrollEnd**: Component that shows where the scroll ends
- **m.Touch**: Component that analyzes actions, including scroll and tap, by analyzing user’s touch movement in the base layers.

## **How to build**
Clone a copy of JMC from git repo by running:
```bash
$ git clone https://github.com/naver/jindojs-jmc.git
```

Enter the jindojs-jmc directory and make sure have all the necessary dependencies :
```bash
$ cd jindojs-jmc && npm install
```

Run the build script:
```bash
$ grunt
```
The result of your build, will be found in the `'dist/'` subdirectory with the minified version and API document.

## **Running the Unit Tests**
Make sure you have the necessary dependencies:
```bash
$ npm install
```

Start grunt 'test:*' task:
```bash
$ grunt test:*
```

if you want to test a specific component, put the module's name as a parameter of the test. Here are some example that you might consider.
```bash
$ grunt test:SlideFlicking  #test "jindo.m.SlideFlicking"
$ grunt test:m  #test "jindo.m"
$ grunt test:Touch  #test "jindo.m.Touch"
```

## **Issues**
If you find a bug, please report us via the GitHub issues page.  
https://github.com/naver/jindojs-jmc/issues

## **License**
Licensed under LGPL v2:  
https://www.gnu.org/licenses/old-licenses/lgpl-2.0.html  

[![Analytics](https://ga-beacon.appspot.com/UA-45811892-4/jindojs-jmc/readme)](https://github.com/naver/jindojs-jmc)
