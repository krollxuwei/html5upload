

(function ($) {

	$.fn.html5Uploader = function (options) {

		var crlf = '\r\n';
		var boundary = "iloveigloo";
		var dashes = "--";
		var that;
		var settings = {
			"showProgress":false,
			"name": "uploadedFile",
			"type": "single",
			"postUrl": "Upload.aspx",
			"onClientAbort": null,
			"onClientError": null,
			"onClientLoad": null,
			"onClientLoadEnd": null,
			"onClientLoadStart": null,
			"onClientProgress": null,
			"onServerAbort": null,
			"onServerError": null,
			"onServerLoad": null,
			"onServerLoadStart": null,
			"onServerProgress": null,
			"onServerReadyStateChange": null,
			"onSuccess": null,
			"onHandler":null,
			"checkClick":null,
		};

		if (options) {
			$.extend(settings, options);
		}

		return this.each(function (options) {
			that = this;
			var $this = $(this);
			$this.css('position','relative');
			if (settings.type != "drag") {
				var input = document.createElement("input");
				input.id = "__upload_input__";
				input.type = "file";
				input.style.cssText = "position:absolute;left:-10000px;top:-10000px;";
				if (settings.type == "multiple") {
					input.setAttribute("multiple", "multiple");
				}
				$this.append(input);
				$this.bind("click", function () {
					if(settings.checkClick){
						if(settings.checkClick()){

							input.click();
						}
					}else{
						input.click();
					}
					
				})
				$(input).bind("change", function () {
					var files = this.files;
					for (var i = 0; i < files.length; i++) {
						fileHandler(files[i]);
					}
				});
			} else {
				$this.bind("dragenter dragover", function () {
					return false;
				}).bind("drop", function (e) {
					var files = e.originalEvent.dataTransfer.files;
					for (var i = 0; i < files.length; i++) {
						fileHandler(files[i]);
					}
					return false;
				});
			}
		});

		function fileHandler(file) {
			console.log("test=" + JSON.stringify(file));
			if(settings.onHandler){
				settings.onHandler();
			}

			if ('FileReader' in window) {
				var fileReader = new FileReader();
				fileReader.onabort = function (e) {
					if (settings.onClientAbort) {
						settings.onClientAbort(e, file);
					}
				};
				fileReader.onerror = function (e) {
					if (settings.onClientError) {
						settings.onClientError(e, file);
					}
				};
				fileReader.onload = function (e) {
					if(settings.showProgress){
						$(that).find('.progress_label').remove();
						var div = document.createElement("div");
						div.innerHTML = "0%";
						div.className = "progress_label";
						div.style.cssText = "width:100%;position:absolute;bottom: 0px;background:rgba(0,0,0,.4);padding:3px;box-sizing: border-box;color:white;text-align: right;";
						$(that).append(div);
					}

					if (settings.onClientLoad) {
						settings.onClientLoad(e, file);
					}
				};
				fileReader.onloadend = function (e) {
					if (settings.onClientLoadEnd) {
						settings.onClientLoadEnd(e, file);
					}
				};
				fileReader.onloadstart = function (e) {
					if (settings.onClientLoadStart) {
						settings.onClientLoadStart(e, file);
					}
				};
				fileReader.onprogress = function (e) {
					if (settings.onClientProgress) {
						settings.onClientProgress(e, file);
					}
				};
				fileReader.readAsDataURL(file);
			} else {
				console.log("FileReader is not defined");
			}

			var xmlHttpRequest = new XMLHttpRequest();
			xmlHttpRequest.upload.onabort = function (e) {
				if (settings.onServerAbort) {
					settings.onServerAbort(e, file);
				}
			};
			xmlHttpRequest.upload.onerror = function (e) {
				if (settings.onServerError) {
					settings.onServerError(e, file);
				}
			};
			xmlHttpRequest.upload.onload = function (e) {
				if (settings.onServerLoad) {
					settings.onServerLoad(e, file);
				}
			};
			xmlHttpRequest.upload.onloadstart = function (e) {
				if (settings.onServerLoadStart) {
					settings.onServerLoadStart(e, file);
				}
			};
			xmlHttpRequest.upload.onprogress = function (e) {
				if(settings.showProgress){
					var totalSize = e.totalSize;
					var current = e.position;
					var baifenbi = parseInt(parseFloat(current) / parseFloat(totalSize) * 100);
					if (baifenbi >= 99) baifenbi = 99;
					$(that).find('.progress_label').html(baifenbi + "%");
				}

				if (settings.onServerProgress) {
					settings.onServerProgress(e, file);
				}
			};
			xmlHttpRequest.onreadystatechange = function (e) {
				if (settings.onServerReadyStateChange) {
					settings.onServerReadyStateChange(e, file, xmlHttpRequest.readyState);
				}
				if (settings.onSuccess && xmlHttpRequest.readyState == 4 && xmlHttpRequest.status == 200) {
					if(settings.showProgress){
						$(that).find('.progress_label').html("100%");
					}
					$('#__upload_input__').val('');
					settings.onSuccess(e, file, xmlHttpRequest.responseText);
				}
			};
			var url = settings.postUrl;
			if(typeof settings.postUrl==="function") 
				url = settings.postUrl();
			xmlHttpRequest.open("POST", url, true);

			if (file.getAsBinary) { // Firefox

				var data = dashes + boundary + crlf +
                    "Content-Disposition: form-data;" +
                    "name=\"" + settings.name + "\";" +
                    "filename=\"" + unescape(encodeURIComponent(file.name)) + "\"" + crlf +
                    "Content-Type: application/octet-stream" + crlf + crlf +
                    file.getAsBinary() + crlf +
                    dashes + boundary + dashes;

				xmlHttpRequest.setRequestHeader("Content-Type", "multipart/form-data;boundary=" + boundary);
				xmlHttpRequest.sendAsBinary(data);

			} else if (window.FormData) { // Chrome

				var formData = new FormData();
				formData.append(settings.name, file);

				xmlHttpRequest.send(formData);

			}
		}

	};

})(jQuery);