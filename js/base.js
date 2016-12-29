angular.module('smallbore', ['ionic'])
//ionic 原装路由
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "menu.html",
      controller: 'AppCtrl'
    })

    .state('app.playlists', {
      url: "/playlists",
      views: {
        'menuContent' :{
          templateUrl: "playlists.html",
          controller: 'PlaylistsCtrl'
        }
      }
    })
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/playlists');
})
//个人中心控制器
.controller('AppCtrl', function($scope) {
})
//播放列表控制器
.controller('PlaylistsCtrl', function($scope,$http,$timeout) {

//	$scope.keyword = {text:""}; //ionic ng-model无法获取时，需加成对象。或继承在页面加$parent来传递
//搜索歌曲
  $scope.search = function(){
  	$http({
  		method:"JSONP",
  		url: 'https://www.xiami.com/search/json',
  		params: {
							k: $scope.keyword,
							t: 1,
							callback: 'JSON_CALLBACK'
			}
  	}).success(function(data){
  		$scope.list = data;
  	})
  	//点击LI获取播放信息
  	$scope.clickPlay = function(song_id){
  		$scope.curNum = this.$index;
  		$scope.playSong(song_id);
  	}
  }
  
  $scope.playSong = function(song_id) {
    //获取当前歌曲id
    //搜索id
    $http({
        method: 'JSONP',
        url: "https://api.lostg.com/music/" + song_id,
        params: {
            lyric: 1,
            callback: 'JSON_CALLBACK'
        }
    }).success(function(data) {
        //改变底部的界面
        $scope.playCover = data.album_pic;
        $scope.playName = data.title;
        $scope.playSinger = data.singer;
        $scope.playlyric = data.lyric;
        $scope.playIcon = false;
        oPlayer.src = data.location;
        
        //先重载,然后开始播放
        $scope.lyrics();
        oPlayer.load();
        oPlayer.play();
    }).error(function() {
        //若果没有资源是执行信息告知
        // console.log('没有资源')
        $scope.showTips = true;
        $timeout(function() {
            $scope.showTips = false;
        }, 1000)
    })
}
  //获取播放元素节点
var oPlayer = document.getElementById('player');
//格式化播放时间
    function formate(t) {
        t = parseInt(t)
        var min = parseInt(t / 60);
        var sec = t % 60;
        min = min < 10 ? '0' + min : min;
        sec = sec < 10 ? '0' + sec : sec;
        var str = min + ':' + sec
        return str;
    }
    //获取滚动条
    var oTimes = document.getElementById('times');
    var oProbar = document.getElementById('pro-bar');
    //监听当前的播放时间 
    oPlayer.ontimeupdate = function() {
        var str = formate(this.currentTime)
        //显示时间
        oTimes.innerHTML = str;
        //更改进度条
        var per = ((this.currentTime / oPlayer.duration)).toFixed(2);
        oProbar.style.width = per*100 +'%';
        //更改歌词
        var t =parseInt(this.currentTime);
	      lrc.jump(t);
    }
//定义获取节点
function $(id){
		return document.getElementById(id);
}
//截取歌词
$scope.lyrics = function(){
	  	lrc.init($scope.playlyric);
}

var lrc ={
			    regex_trim: /^\s+|\s+$/,//正则，去掉首尾空格
			    // 解析歌词
			    init:function(lrctext){
			        var arr = lrctext.split("\n");
			        var html="";
			        for(var i =0;i<arr.length;i++){
			            var item =arr[i].replace(this.regex_trim,"");//每一句分割出来，空格变为空
			            var ms= item.split("]");
			            var mt = ms[0].replace("[","");
			            var m =mt.split(":");
			            var num = parseInt(m[0]*60+m[1]*1);
			            var lrc=ms[1];
			            if (lrc) {
			                html+="<li id='t_"+num+"'>"+lrc+"</li>"
			            };
			        };
			        $("lrc_list").innerHTML =html;
			    },
			    // 歌词跳动
			    jump:function(duration){
			        // console.log(duration);
			        //获取当前监听到的li
			        var dom =$("t_"+duration);
			        var lrcbox = $("lrc_list");
			        if(dom){
			            var arr = this.siblings(dom);
			            for(var i=0 ;i<arr.length;i++){
			                arr[i].className="";
			            }
			            dom.className="hover";
			            var index = this.indexof(dom)-4;
			            lrcbox.style.marginTop = (index<0?0:index)*-22+"px";
			        }
			
			    },
			    // 判断下标
			    indexof:function(dom){
			        var listDoms =dom.parentElement.children;
			        var index =0 ;
			        for(var i=0;i<listDoms.length;i++){
			            if(listDoms[i] == dom){
			                index =i;
			                break;
			            }
			        }
			        return index;
			    },
			    // 判断同辈元素
			    siblings:function(dom){
			        var listDoms = dom.parentElement.children;
			        var arr = [];
			        for(var i = 0; i<listDoms.length; i++){
			            if (listDoms[i] != dom) {
			                arr.push(listDoms[i]);
			            }
			        }
			        return arr;
			    }
			}
//暂停播放
$scope.play = function() {
    $scope.playIcon = !$scope.playIcon;
//  console.log($scope.playIcon)
    //图标和播放控制是一致的
    if ($scope.playIcon) {
        oPlayer.pause();
    } else {
        oPlayer.play();
    }
};

  //显示歌曲页面
$scope.showSecond = false;
$scope.showSec=function(){
//          console.log(888)
            $scope.showSecond = true;
}
//检测回车键
document.onkeydown=function(e){
    var e = e|| event;
    if(e.keyCode == 13){
       if($scope.keyword){
        $scope.search();
//console.log($scope.woshizhu)
    		} 
    }
}
// 上一首
$scope.pre=function(){
    $scope.curNum--;
    if($scope.curNum <=0){
       $scope.curNum = 0 
    }
    var id = $scope.list[$scope.curNum].song_id;
    $scope.playSong(id);
}
//播放下一首歌曲
$scope.next=function(){
    $scope.curNum++;
    if($scope.curNum >= $scope.list.length){
       $scope.curNum = $scope.list.length ;
    }
    var id = $scope.list[$scope.curNum].song_id;
    $scope.playSong(id);
}

})

