
# Description


# usage
import the webcomponenet

    ```javascript
    <script type="module" src="chicXML.mjs"></script>


    ```

then add tags to your page as desired.
the content for the xml _must_ be encosed in script tags (with a non javascript type) to prevent it being interpreted by the HTML parser.



```html
    <chic-xml>
        <script type='text/xmldata'>
            <xml>
                <tocollapse><tocollapse2><tocollapse3></tocollapse3></tocollapse2></tocollapse>
                <!-- comment -->
                <description attr1='val1' attr='val2' attr3='val3'>        <trainPosition objectRef='TrainManager_18' dynamicStateCode='BERTH' id='tp_18_3'>                    <genericState/><genericState/><genericState/><genericState/>                    <trainStep>                       <timeStamp at='2021-12-16T09:37:37+10:00'/>                        <fromPosition>berth_SDE5304</fromPosition>                        <toPosition>berth_BYO64</toPosition>                        <positionType>BERTH</positionType>                    </trainStep>                </trainPosition>                <of attr1='val1' attr='val2' attr3='val3'>Hello</of><og /><blob> </blob><!--  Comment here --><![CDATA[sdfsdf]]><childNode><bob>fd<bob2></bob2><bob21 /></bob></childNode><!--Second Comment--></description>
            </xml>
            </script>
    </chic-xml>
```

# Known Issues

* if the embedded xml has a &lt;head&gt; tag then it sometimes has a stylesheet added incorrectly