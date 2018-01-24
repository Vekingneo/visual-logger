

# Visual-logger
Visual-logger is a tool provided a easy way of  viewing error log and console log on mobile devices while debugging. Enhanced error stack info is also provided.

To startup your mobile visual console:
1. Add script tag at start of you HTML or JS file:


```
<script src="./visual-logger.js"></script>
```

	
2. Set the config variables:
    

```
visualLogger.setConfig('detail',true) //open up detial console
visualLogger.setConfig('overlay',true)	//open up visual(overlay) console for mobile
```


3. Initiate the logger


```
visualLogger.init();
```



you enable/disable the console layer by clicking at the console button:

![image](http://github.com/Vekingneo/visual-logger/raw/master/images/visual-logger-pic.jpeg)
	


