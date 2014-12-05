LeanComponents.define('lean.main', {
  created: function(props) {
    
    this.autorun(function() {
      var layoutData = LayoutData.get();
      if(layoutData) {
        this.setState({layout: layoutData.layout, regions: layoutData.regions});
      }
    });
  },
});